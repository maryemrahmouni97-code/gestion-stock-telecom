package com.telecom.stock_management.entity;

import com.telecom.stock_management.enums.DecisionMaintenance;
import com.telecom.stock_management.enums.EtatMaintenance;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "maintenance")
public class Maintenance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "materiel_id", nullable = false)
    private Materiel materiel;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "region_id", nullable = false)
    private Region region;

    @Column(nullable = false)
    private Integer quantite;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EtatMaintenance etat = EtatMaintenance.DEFECTUEUX;

    @Column(name = "date_declaration", nullable = false)
    private LocalDateTime dateDeclaration = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(name = "decision_admin", nullable = false)
    private DecisionMaintenance decisionAdmin = DecisionMaintenance.EN_ATTENTE;

    @Column(columnDefinition = "TEXT")
    private String commentaire;

    public Maintenance() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Materiel getMateriel() {
        return materiel;
    }

    public void setMateriel(Materiel materiel) {
        this.materiel = materiel;
    }

    public Region getRegion() {
        return region;
    }

    public void setRegion(Region region) {
        this.region = region;
    }

    public Integer getQuantite() {
        return quantite;
    }

    public void setQuantite(Integer quantite) {
        this.quantite = quantite;
    }

    public EtatMaintenance getEtat() {
        return etat;
    }

    public void setEtat(EtatMaintenance etat) {
        this.etat = etat;
    }

    public LocalDateTime getDateDeclaration() {
        return dateDeclaration;
    }

    public void setDateDeclaration(LocalDateTime dateDeclaration) {
        this.dateDeclaration = dateDeclaration;
    }

    public DecisionMaintenance getDecisionAdmin() {
        return decisionAdmin;
    }

    public void setDecisionAdmin(DecisionMaintenance decisionAdmin) {
        this.decisionAdmin = decisionAdmin;
    }

    public String getCommentaire() {
        return commentaire;
    }

    public void setCommentaire(String commentaire) {
        this.commentaire = commentaire;
    }
}
