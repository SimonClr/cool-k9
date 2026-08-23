# Protection de la branche `main`

Les tâches de test doivent réussir avant toute intégration. Le réglage vit dans
GitHub, pas dans le dépôt : il n'existe aucun fichier à committer pour l'activer.

## Par l'interface

Settings → Branches → Add branch ruleset (ou Add rule) sur `main` :

1. **Require a pull request before merging**
2. **Require status checks to pass before merging**
   - cocher *Require branches to be up to date before merging*
   - sélectionner les contrôles : `build-libs`, `build-front`, `build-back`,
     `test-back`, `test-front`
3. Enregistrer.

> Les contrôles n'apparaissent dans la liste qu'après une première exécution du
> workflow : ouvrir une pull request une fois, puis revenir les sélectionner.

## Par la ligne de commande

```sh
gh api -X PUT repos/SimonClr/cool-k9/branches/main/protection \
  --input - <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["build-libs", "build-front", "build-back", "test-back", "test-front"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null
}
JSON
```

## Vérification

Ouvrir une pull request dont un test échoue volontairement : le bouton de fusion
doit rester bloqué tant que `test-back` ou `test-front` est en échec.
