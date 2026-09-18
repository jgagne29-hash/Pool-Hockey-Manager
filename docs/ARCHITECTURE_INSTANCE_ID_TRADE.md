# 💡 Architecture de Propriété Unique : L'utilité du `instance_id`

## 1. La Distinction Fondamentale (Catalogue vs Actif Possédé)

Dans les systèmes de trading de cartes modernes (Sorare, EA Sports FC, NBA Top Shot, Fantasy Pools LNH) :

- **Le Modèle Catalogue (`edition_id`) :**
  Définit les attributs immuables d'une carte dans la bibliothèque globale (ex: *Connor Bedard - Recrue Calder - Épique x1.5*).
- **L'Instance Possédée (`instance_id`) :**
  Représente **l'exemplaire physique/numérique unique** détenu par un participant du pool à un instant $T$.

```
Format standardisé de l'instance_id :
[nhl_id]_[timestamp_creation]_[index_ou_uuid]
Exemple : 8484144_1726674391204_0
```

---

## 2. Pourquoi cet `instance_id` est Essentiel lors des Échanges ?

1. **Anti-Duplication (Double-Spending) :**
   Si deux poolers (ex: *Alex* et *Marc*) possèdent chacun une carte Épique de Connor Bedard, l'utilisation de l'`edition_id` seul créerait une ambiguïté dans la base de données. L'`instance_id` garantit que l'exemplaire transféré est bien celui de Marc.
2. **Historique de Traçabilité (Provenance & Ledger) :**
   Chaque `instance_id` possède son propre journal :
   - Date et heure exacte du tirage dans le Booster Pack (`minted_at`).
   - Identifiant du premier propriétaire (`original_owner_id`).
   - Journal des échanges successifs (`trade_history`).
3. **Numéro de Série / Tirage Limité :**
   Permet d'ajouter une valeur de collection prestige (ex: *Bedard Épique n° 003 / 100*).

---

## 3. Schéma SQL Recommandé pour la Base de Données

```sql
-- 1. Table des cartes possédées par les utilisateurs
CREATE TABLE pool_user_cards (
    instance_id VARCHAR(100) PRIMARY KEY,      -- Identifiant unique (ex: 8484144_1726674391204_0)
    owner_user_id UUID NOT NULL,                -- Propriétaire actuel de la carte
    nhl_id INT NOT NULL,                        -- ID officiel du joueur LNH
    edition_id VARCHAR(50) NOT NULL,            -- Clé d'édition (base, allstar, prime, ultra)
    rarity VARCHAR(20) NOT NULL,                -- Common, Rare, Epic, Ultra-Rare
    multiplier NUMERIC(3, 2) NOT NULL,          -- 1.0, 1.2, 1.5, 2.0
    cap_hit NUMERIC(12, 2) NOT NULL,            -- Masse salariale impactée
    minted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'IN_INVENTORY'   -- IN_INVENTORY, IN_LINEUP, IN_TRADE_ESCROW
);

-- 2. Table des transactions d'échanges (Audit Ledger)
CREATE TABLE pool_trade_transactions (
    trade_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_user_id UUID NOT NULL,
    receiver_user_id UUID NOT NULL,
    sender_instances JSONB NOT NULL,            -- Array des instance_id cédés par l'offrant
    receiver_instances JSONB NOT NULL,          -- Array des instance_id cédés par le receveur
    sender_total_market_value INT NOT NULL,     -- Score calculé (Formule officielle)
    receiver_total_market_value INT NOT NULL,
    discrepancy_ratio NUMERIC(5, 2) NOT NULL,   -- Doit être <= 15.00%
    status VARCHAR(20) DEFAULT 'COMPLETED',     -- PENDING, COMPLETED, REJECTED
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 4. Transaction Atomique d'Échange (Exécution)

Lors de la confirmation de la transaction sur l'interface :
```sql
BEGIN TRANSACTION;

-- 1. Transférer la carte A vers l'utilisateur B
UPDATE pool_user_cards 
SET owner_user_id = :target_user_id 
WHERE instance_id = '8478402_1726674391204_0';

-- 2. Transférer la carte B vers l'utilisateur A
UPDATE pool_user_cards 
SET owner_user_id = :current_user_id 
WHERE instance_id = '8479318_1726674391204_1';

-- 3. Enregistrer la trace dans le registre d'audit
INSERT INTO pool_trade_transactions (...) VALUES (...);

COMMIT;
```
