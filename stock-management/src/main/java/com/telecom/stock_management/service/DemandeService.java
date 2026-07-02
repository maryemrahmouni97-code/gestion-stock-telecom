package com.telecom.stock_management.service;

import com.telecom.stock_management.entity.Demande;
import com.telecom.stock_management.entity.DemandeDetail;
import com.telecom.stock_management.entity.Materiel;
import com.telecom.stock_management.entity.Mouvement;
import com.telecom.stock_management.entity.Region;
import com.telecom.stock_management.entity.Stock;
import com.telecom.stock_management.entity.User;
import com.telecom.stock_management.enums.DemandeStatus;
import com.telecom.stock_management.enums.TypeMouvement;
import com.telecom.stock_management.enums.UserRole;
import com.telecom.stock_management.repository.DemandeRepository;
import com.telecom.stock_management.repository.MaterielRepository;
import com.telecom.stock_management.repository.MouvementRepository;
import com.telecom.stock_management.repository.RegionRepository;
import com.telecom.stock_management.repository.StockRepository;
import com.telecom.stock_management.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class DemandeService {

    private final DemandeRepository demandeRepository;
    private final StockRepository stockRepository;
    private final RegionRepository regionRepository;
    private final MaterielRepository materielRepository;
    private final MouvementRepository mouvementRepository;
    private final UserRepository userRepository;

    public DemandeService(DemandeRepository demandeRepository, StockRepository stockRepository,
            RegionRepository regionRepository, MouvementRepository mouvementRepository,
            UserRepository userRepository, MaterielRepository materielRepository) {
        this.demandeRepository = demandeRepository;
        this.stockRepository = stockRepository;
        this.regionRepository = regionRepository;
        this.materielRepository = materielRepository;
        this.mouvementRepository = mouvementRepository;
        this.userRepository = userRepository;
    }

    public List<Demande> findAll() { return demandeRepository.findAll(); }

    public List<Demande> findByStatut(DemandeStatus statut) { return demandeRepository.findByStatut(statut); }

    public Demande findById(Long id) {
        return demandeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demande introuvable"));
    }

    public Demande create(Demande demande) {
        demande.setId(null);
        demande.setStatut(DemandeStatus.EN_ATTENTE);
        demande.setMotifRefus(null);
        demande.setDateTraitement(null);
        demande.setTraitePar(null);
        attachDetails(demande);
        return demandeRepository.save(demande);
    }

    public Demande update(Long id, Demande demande) {
        Demande existing = findById(id);
        if (existing.getStatut() != DemandeStatus.EN_ATTENTE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Une demande traitee ne peut plus etre modifiee");
        }
        demande.setId(id);
        demande.setStatut(DemandeStatus.EN_ATTENTE);
        demande.setMotifRefus(null);
        demande.setDateTraitement(null);
        demande.setTraitePar(null);
        attachDetails(demande);
        return demandeRepository.save(demande);
    }

    public void delete(Long id) { demandeRepository.delete(findById(id)); }

    @Transactional
    public Demande accepter(Long id, Long utilisateurId) {
        Demande demande = findPending(id);
        User utilisateur = resolveUser(utilisateurId);
        Region stockCentral = regionRepository.findByNomRegionIgnoreCase("Stock Central")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Configuration invalide : la region Stock Central est introuvable"));
        Region regionDestination = resolveRegionDestination(demande);

        // Verifier toutes les lignes et cumuler les doublons avant de modifier le moindre stock.
        Map<Long, Integer> quantitesParMateriel = new LinkedHashMap<>();
        Map<Long, Materiel> materielsParId = new LinkedHashMap<>();
        List<DemandeDetail> details = demande.getDetails();
        if (details == null || details.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La demande ne contient aucun materiel");
        }
        for (DemandeDetail detail : details) {
            Materiel materiel = resolveMateriel(detail);
            materielsParId.put(materiel.getId(), materiel);
            quantitesParMateriel.merge(materiel.getId(), detail.getQuantite(), Integer::sum);
        }
        for (Map.Entry<Long, Integer> ligne : quantitesParMateriel.entrySet()) {
            Stock source = stockRepository.findWithLockByRegionIdAndMaterielId(
                    stockCentral.getId(), ligne.getKey()).orElse(null);
            int disponible = source == null ? 0 : source.getQuantite();
            if (disponible < ligne.getValue()) {
                Materiel materiel = materielsParId.get(ligne.getKey());
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Stock insuffisant pour le materiel " + describeMateriel(materiel)
                                + ". Quantite disponible : " + disponible
                                + ". Quantite demandee : " + ligne.getValue());
            }
        }

        for (Map.Entry<Long, Integer> ligne : quantitesParMateriel.entrySet()) {
            Materiel materiel = materielsParId.get(ligne.getKey());
            Integer quantite = ligne.getValue();
            Stock source = stockRepository.findWithLockByRegionIdAndMaterielId(
                    stockCentral.getId(), ligne.getKey())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Stock central introuvable pour le materiel " + describeMateriel(materiel)));
            source.setQuantite(source.getQuantite() - quantite);

            Stock destination = stockRepository.findWithLockByRegionIdAndMaterielId(
                    regionDestination.getId(), ligne.getKey()).orElseGet(() -> {
                        Stock stock = new Stock();
                        stock.setRegion(regionDestination);
                        stock.setMateriel(materiel);
                        stock.setQuantite(0);
                        stock.setSeuilMinimum(0);
                        return stock;
                    });
            destination.setQuantite(destination.getQuantite() + quantite);
            stockRepository.save(source);
            stockRepository.save(destination);

            Mouvement mouvement = new Mouvement();
            mouvement.setTypeMouvement(TypeMouvement.SORTIE);
            mouvement.setMateriel(materiel);
            mouvement.setQuantite(quantite);
            mouvement.setRegionSource(stockCentral);
            mouvement.setRegionDestination(regionDestination);
            mouvement.setDateMouvement(LocalDateTime.now());
            mouvement.setUtilisateur(utilisateur);
            mouvement.setCommentaire("Transfert automatique vers " + regionDestination.getNomRegion()
                    + " - demande #" + demande.getId());
            mouvementRepository.save(mouvement);
        }

        demande.setStatut(DemandeStatus.ACCEPTEE);
        demande.setMotifRefus(null);
        demande.setDateTraitement(LocalDateTime.now());
        demande.setTraitePar(utilisateur);
        return demandeRepository.save(demande);
    }

    @Transactional
    public Demande refuser(Long id, String motifRefus, Long utilisateurId) {
        Demande demande = findPending(id);
        User utilisateur = resolveUser(utilisateurId);
        if (motifRefus == null || motifRefus.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le motif du refus est obligatoire");
        }
        demande.setStatut(DemandeStatus.REFUSEE);
        demande.setMotifRefus(motifRefus.trim());
        demande.setDateTraitement(LocalDateTime.now());
        demande.setTraitePar(utilisateur);
        return demandeRepository.save(demande);
    }

    private Demande findPending(Long id) {
        Demande demande = findById(id);
        if (demande.getStatut() != DemandeStatus.EN_ATTENTE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cette demande a deja ete traitee");
        }
        return demande;
    }

    private User resolveUser(Long id) {
        if (id != null) {
            return userRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));
        }
        return userRepository.findFirstByRole(UserRole.ADMIN).orElse(null);
    }

    private Materiel resolveMateriel(DemandeDetail detail) {
        if (detail == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Detail de demande invalide : ligne vide");
        }
        if (detail.getQuantite() == null || detail.getQuantite() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Detail de demande invalide : la quantite doit etre superieure a 0");
        }
        if (detail.getMateriel() == null || detail.getMateriel().getId() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Materiel introuvable pour une ligne de la demande");
        }
        Long materielId = detail.getMateriel().getId();
        return materielRepository.findById(materielId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Materiel introuvable : id=" + materielId));
    }

    private Region resolveRegionDestination(Demande demande) {
        if (demande.getRegion() == null || demande.getRegion().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Donnees invalides : la demande n'a pas de region destination");
        }
        Long regionId = demande.getRegion().getId();
        return regionRepository.findById(regionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Donnees invalides : region destination introuvable id=" + regionId));
    }

    private String describeMateriel(Materiel materiel) {
        if (materiel == null) return "id inconnu";
        String reference = materiel.getReference() == null ? "sans reference" : materiel.getReference();
        String nom = materiel.getNom() == null ? "sans nom" : materiel.getNom();
        return "#" + materiel.getId() + " (" + reference + " - " + nom + ")";
    }

    private void attachDetails(Demande demande) {
        if (demande.getDetails() == null) return;
        for (DemandeDetail detail : demande.getDetails()) detail.setDemande(demande);
    }
}
