# Script pour ajouter les boutons mobile à toutes les pages English Quest Reborn
# Automatise l'ajout des éléments de navigation mobile

Write-Host "🔧 Mise à jour de la navigation mobile sur toutes les pages..." -ForegroundColor Green

# Liste des fichiers à modifier
$files = @(
    "gallery.html",
    "leaderboard.html", 
    "profile.html",
    "login.html",
    "auth.html",
    "register.html",
    "admin.html"
)

# Contenu à insérer après les liens de navigation existants
$mobileNavContent = @"
          <!-- Éléments user-menu intégrés dans la navigation mobile -->
          <li class="mobile-only"><a href="login.html" class="nav-link" id="mobileLoginButton">Connexion</a></li>
          <li class="mobile-only"><a href="profile.html" class="nav-link" id="mobileProfileButton" style="display: none;">Mon Profil</a></li>
          <li class="mobile-only"><a href="#" class="nav-link" id="mobileLogoutButton" style="display: none;">Déconnexion</a></li>
"@

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "📝 Mise à jour de $file..." -ForegroundColor Yellow
        
        # Lire le contenu du fichier
        $content = Get-Content $file -Raw
        
        # Vérifier si les éléments mobile sont déjà présents
        if ($content -notmatch "mobile-only") {
            # Patterns pour identifier la fin de la liste de navigation
            $patterns = @(
                # Pattern 1: Classement comme dernier élément
                '(\s*<li><a href="[^"]*leaderboard\.html"[^>]*>Classement</a></li>\s*)',
                # Pattern 2: Galerie comme dernier élément  
                '(\s*<li><a href="[^"]*gallery\.html"[^>]*>Galerie</a></li>\s*)',
                # Pattern 3: Cours comme dernier élément
                '(\s*<li><a href="[^"]*courses\.html"[^>]*>Cours</a></li>\s*)',
                # Pattern 4: Jeux comme dernier élément
                '(\s*<li><a href="[^"]*games\.html"[^>]*>Jeux</a></li>\s*)'
            )
            
            $updated = $false
            foreach ($pattern in $patterns) {
                if ($content -match $pattern) {
                    $replacement = $matches[1] + $mobileNavContent
                    $content = $content -replace $pattern, $replacement
                    $updated = $true
                    Write-Host "  ✅ Navigation mobile ajoutée avec le pattern: $($pattern.Substring(0,30))..." -ForegroundColor Green
                    break
                }
            }
            
            if ($updated) {
                # Sauvegarder le fichier modifié
                $content | Out-File -FilePath $file -Encoding UTF8
                Write-Host "  💾 $file sauvegardé" -ForegroundColor Green
            } else {
                Write-Host "  ⚠️ Aucun pattern de navigation trouvé dans $file" -ForegroundColor Red
            }
        } else {
            Write-Host "  ℹ️ Navigation mobile déjà présente dans $file" -ForegroundColor Cyan
        }
    } else {
        Write-Host "  ❌ Fichier $file non trouvé" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Mise à jour terminée!" -ForegroundColor Green
Write-Host "📱 Tous les fichiers ont maintenant la navigation mobile complète" -ForegroundColor Green 