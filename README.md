# Vintage Phone Collector — Lumia 535

Documentăm restaurarea unui Nokia Lumia 535 și testarea jocurilor clasice Windows Phone / Windows 10 Mobile. Scopul este să recuperăm experiența originală folosind pachete și instrumente deja disponibile, să păstrăm starea funcțională a telefonului și să distingem clar între ce am observat și ce doar presupunem.

Proiectul nu urmărește modificări de OS, bootloader sau firmware. Nu distribuim jocuri protejate de drepturi de autor; păstrăm aici istoricul, metadatele, rezultatele testelor și sursele publice.

Skill-ul reutilizabil pentru lucrul cu proiectul este în [`codex-skill/vintage-phone-collector/SKILL.md`](codex-skill/vintage-phone-collector/SKILL.md). Acest README este jurnalul acestui dispozitiv și al investigațiilor făcute până acum.

## Starea curentă

| Element | Stare documentată |
| --- | --- |
| Telefon | Nokia Lumia 535 RM-1089 |
| Sistem | Windows 10 Mobile `10.0.14393.2551` |
| Firmware | `02074.00000.15234.28006` |
| Developer Mode | Activat |
| XAP prin USB | XAP Deployment funcțional |
| APPX Minecraft | Investigație locală; nu a fost instalat |
| Temple Run | Instabil: a pornit o singură dată, apoi a început să se închidă la pornire |

Ultima actualizare: 7 noiembrie 2026.

## Telefon

- Model: Nokia Lumia 535, variantă RM-1089
- Procesor: Qualcomm 8212
- Memorie RAM: 1 GB
- Ecran: 540 × 960
- Sistem curent: Windows 10 Mobile `10.0.14393.2551`
- Firmware documentat: `02074.00000.15234.28006`

Specificațiile provin din identificarea telefonului în proiect și trebuie păstrate separat de compatibilitatea declarată de un pachet. Faptul că o aplicație țintește ARM sau o versiune minimă de Windows nu garantează că va rula bine pe acest hardware.

## Istoricul sistemului de operare

### Windows Phone 8.1 inițial

Starea inițială documentată:

- OS `8.10.14234.375`
- firmware `02074.00000.15234.28006`
- Lumia Denim

### Upgrade offline la Windows 10 Mobile

Telefonul a ajuns la buildul `10.0.10586.107` printr-o procedură offline OUP. Numele exact al utilitarului, versiunea pachetului și jurnalul complet al comenzilor nu au fost încă recuperate.

### Etapă intermediară neconfirmată

Buildul `10.0.14293.1066` a fost oferit sau discutat în timpul upgrade-ului. Nu avem încă dovadă suficientă că a fost instalat complet și nici succesiunea exactă a actualizărilor.

### Sistemul curent

Buildul documentat în prezent este `10.0.14393.2551` (generația Anniversary Update / 1607). Firmware-ul a rămas documentat ca `02074.00000.15234.28006` și trebuie tratat distinct de versiunea OS.

## PC și instrumente

PC-ul de proiect rulează Windows și PowerShell 5.1. Windows Phone SDK 8.0 este instalat.

### Deployment XAP prin USB

Executabilul XAP Deployment:

```powershell
$deploy = "C:\Program Files (x86)\Microsoft SDKs\Windows Phone\v8.0\Tools\XAP Deployment\XapDeploy.exe"
Start-Process $deploy
```

Metoda a fost folosită cu succes pentru instalarea pachetelor XAP: conectare USB, telefon deblocat, selectare `Device`, alegerea pachetului și deploy. Confirmăm instalarea și funcționarea separat, direct pe telefon.

În notele proiectului, executabilul a fost identificat ca Microsoft-signed, versiunea `11.0.50727.38`. Windows Phone SDK 8.0 a fost instalat dintr-un ISO; proveniența exactă a ISO-ului și pașii instalării nu sunt documentați complet.

Developer Mode este activat. Device Portal și pairing-ul au fost folosite în timpul configurării anterioare, dar setările și procedura exactă trebuie recuperate din jurnalul original înainte să le transformăm în instrucțiuni reproductibile.

**XapDeploy este pentru XAP.** Nu presupunem că poate instala APPX.

### Unelte APPX găsite pe PC

La verificarea din 7 noiembrie 2026, uneltele erau instalate în Windows Kits 8.0, dar nu erau în PATH:

- `C:\Program Files (x86)\Windows Kits\8.0\bin\x64\MakeAppx.exe`
- `C:\Program Files (x86)\Windows Kits\8.0\bin\x64\SignTool.exe`
- există și versiunile `x86` în același director `bin`
- `tar.exe`, `certutil.exe`, `Get-AuthenticodeSignature` și cmdleturile Appx sunt disponibile

Versiunea MakeAppx din SDK 8.0 oferă `pack` și `unpack`, nu o comandă separată `validate`. O încercare de `unpack` a pachetului Minecraft nu a produs fișiere în directorul temporar; rezultatul este neconcludent. Nu am reinstalat SDK-uri și nu am adăugat componente.

Aceste rezultate actualizează nota mai veche conform căreia `signtool.exe` și `MakeAppx.exe` nu ar exista pe PC: ele există, însă se află în Windows Kits 8.0 și nu sunt în PATH.

## Jocuri și aplicații testate

Statusurile de mai jos se bazează pe comportamentul observat pe telefon, nu doar pe metadatele pachetelor.

| Joc | Versiune | Stare actuală | Observații |
| --- | --- | --- | --- |
| Angry Birds Classic | `5.0.2.0` | Parțial funcțional | Pornește, dar progresul este blocat de achiziția versiunii complete / promptul de cumpărare. |
| Angry Birds Classic | `1.5.3.0` | Funcțional | Versiunea XNA mai veche pornește și poate fi jucată; este versiunea preferată în colecția curentă. Pachetul include un marker `AppCracked` de zero bytes, deci distribuția originală nu este verificată independent. |
| Asphalt 5 | `1.33.0.0` | Funcțional | Instalat și rulat. Este un joc vechi pe hardware limitat; păstrăm observațiile de performanță distincte de erori. |
| Temple Run | `1.5.3.0` | Instabil | A pornit exact o singură dată; la încercările ulterioare se închide la pornire. Nu îl declarăm funcțional. |
| Minecraft | `1.5.300.0` | Investigație; neinstalat | Pachet ARM inspectat pe PC, dar nu a fost instalat și nu a fost testat pe telefon. |
| Jetpack Joyride | Necunoscut | Pachet negăsit / netestat | Nu avem un pachet obținut și verificat. |
| Subway Surfers | Necunoscut | Planificat / netestat | Nu avem pachet obținut și testat. |
| Fruit Ninja | Necunoscut | Planificat / netestat | Nu avem pachet obținut și testat. |

### Detalii de proveniență cunoscute pentru jocuri

| Pachet | Sursă menționată în proiect | Observație |
| --- | --- | --- |
| Angry Birds `5.0.2.0` | WindowsViet (`file.windowsviet.com`) | Pachet XAP arhivat; prompt de cumpărare la testare. |
| Angry Birds `1.5.3.0` | Winphone Iz | Pachet XAP; conține marker `AppCracked`, deci poate fi modificat. |
| Asphalt 5 `1.33.0.0` | WindowsViet (`file.windowsviet.com`) | Pachet XAP; jocul a fost testat și rulează. |
| Temple Run `1.5.3.0` | Winphone Iz | Pachet XAP; raportul cel mai recent este crash la pornire după o singură lansare reușită. |
| Minecraft `1.5.300.0` | WindowsViet (`file.windowsviet.com`) | Pachet APPX; semnătura și proveniența exemplarului local nu sunt încă validate complet. |

### Detalii din manifestele XAP disponibile

| Joc | Platformă / runtime | Publisher și identificator în manifest | Dimensiune notată |
| --- | --- | --- | --- |
| Angry Birds Classic `5.0.2.0` | Windows Phone 8.0 / Modern Native | Rovio Entertainment Ltd; executabil `AngryBirdsClassic.exe` | Nu este consemnată în notele inițiale. |
| Angry Birds Classic `1.5.3.0` | Windows Phone 7.0 / XNA | Microsoft Game Studios; product ID `{e4571a02-0b87-e011-986b-78e7d1fa76f8}` | `21,053,919` bytes |
| Asphalt 5 `1.33.0.0` | Windows Phone 7.1 / XNA | GAMELOFT SA; product ID `{97e360f9-f018-4c39-ae54-139590c9b048}` | `115,669,153` bytes |
| Temple Run `1.5.3.0` | Windows Phone 8.0 / Silverlight; pachetul include componente Unity | Imangi Studios, LLC; product ID `{1a7cb5f8-792a-4992-b07a-83874c0795ae}` | `23,401,108` bytes |

Pentru Temple Run au fost observate în arhivă `UnityPlayer.dll`, `UnityEngine.dll`, `Assembly-CSharp.dll`, `UnityEngineProxy.dll` și `WinRTBridge.dll`. Prezența componentelor nu explică de una singură crash-ul curent.

Căile locale și dimensiunile exacte ale fișierelor se pot schimba între computere. În sesiunea curentă, pachetele Windows Phone sunt în `C:\Users\vaida\Downloads`, iar APPX-ul Minecraft a fost găsit în `E:\Projects\Lumia`. Nu presupuneți că aceste căi sunt identice pentru alte checkout-uri.

## Minecraft 1.5.300.0 — investigație APPX

### Fișier inspectat

- Nume: `Minecraft for Windows 10 Mobile v1.5.300.0 [file.windowsviet.com].appx`
- Locație găsită în sesiunea curentă: `E:\Projects\Lumia\Minecraft for Windows 10 Mobile v1.5.300.0 [file.windowsviet.com].appx`
- Dimensiune: `66,531,493` bytes
- SHA-256 local: `5C4467E6C9B44606BDD9909892B00F1FE6B1731132CB71798A0DF8E59EE0C1EE`
- Stare: nu a fost instalat și nu a fost modificat

Un hash identifică exemplarului local; fără un hash de referință de la o sursă de încredere, nu demonstrează autenticitatea acestuia.

### Manifest

| Proprietate | Valoare declarată |
| --- | --- |
| Name | `Microsoft.Minecraft` |
| Version | `1.5.300.0` |
| Architecture | `arm` |
| Publisher | `CN=Microsoft Corporation, O=Microsoft Corporation, L=Redmond, S=Washington, C=US` |
| TargetDeviceFamily | `Windows.Universal` |
| MinVersion | `10.0.10240.0` |
| MaxVersionTested | `10.0.16299.0` |
| Executable / EntryPoint | `Minecraft.Windows.exe` / `Minecraft_Win10.App` |

Dependențe declarate:

- `Microsoft.Services.Store.Engagement`, minim `10.0.1610.0`
- `Microsoft.VCLibs.140.00`, minim `14.0.25426.0`

Manifestul include și metadate de build `OperatingSystem 10.0.14393.0` și `WindowsMobile 10.0.16299.0`. Buildul telefonului `14393.2551` depășește `MinVersion`, iar arhitectura declarată este ARM. Aceste fapte fac pachetul eligibil pentru investigație, dar **nu demonstrează compatibilitatea efectivă** cu Lumia 535 sau că jocul va porni pe buildul curent.

Prezența în arhivă a `AppxBlockMap.xml`, `[Content_Types].xml` și `AppxSignature.p7x` arată că pachetul conține aceste fișiere, nu că semnătura sau integritatea pachetului au fost validate.

### Semnătură — rezultate locale

1. Arhiva a putut fi listată fără instalare; manifestul și intrările relevante au fost citite direct din ZIP.
2. `AppxSignature.p7x` începe cu antetul `PKCX`. Trecerea fișierului întreg direct la SignTool a eșuat cu eroarea ASN.1 `0x8009310B`, deci acea încercare nu a stabilit validitatea semnăturii.
3. După eliminarea celor patru octeți `PKCX` într-o copie temporară, SignTool a putut parsa certificatul PKCS#7. Afișează subiectul `Microsoft Corporation`, emitentul `Microsoft Marketplace CA G 007` și timestamp din 28 iulie 2018.
4. Verificarea SignTool nu a reușit să valideze lanțul: au apărut `CERT_TRUST_REVOCATION_STATUS_UNKNOWN`, `CERT_TRUST_IS_OFFLINE_REVOCATION`, `CERT_TRUST_IS_PARTIAL_CHAIN` și `CERT_TRUST_IS_NOT_TIME_VALID`.

Concluzie limitată: **semnătura se parsează după decodarea antetului, dar validarea locală a încrederii a eșuat**. Nu declarăm pachetul autentic sau valid. Nu am confirmat independent că semnătura se leagă de conținutul exact al întregului APPX și nu avem un hash de referință de încredere pentru comparație.

### Instalare și compatibilitate — ce știm și ce nu

Documentația Microsoft pentru Windows 10 indică faptul că buildul 14393 a introdus App Installer pentru `.appx` și `.appxbundle`; aceeași pagină precizează că `.appinstaller` nu este suportat în acel build. Aceasta este documentație Windows 10, dar nu confirmă singură ce interfață de sideload este disponibilă pe Windows 10 Mobile din acest telefon.

Microsoft descrie sideloading-ul ca instalarea unui pachet semnat de un certificat de încredere. Pachetul APPX nu se instalează prin XapDeploy. Metoda exactă și sigură de instalare APPX pe acest Lumia, inclusiv metoda suportată de Device Portal și gestionarea dependențelor, rămâne de confirmat înainte de orice încercare.

Dependențele necesare nu au fost încă verificate pe telefon. Nu instalăm pachetul, dependențe sau certificate și nu schimbăm setări fără să discutăm înainte.

## Reguli pentru continuarea proiectului

1. Lucrăm incremental; explicăm comanda sau operația și rezultatul așteptat înainte de fiecare pas.
2. Prioritizăm fișierele și uneltele deja disponibile; nu reinstalăm SDK-uri fără o cerință concretă.
3. Nu modificăm OS-ul, bootloader-ul, firmware-ul sau partițiile.
4. Nu ștergem jocurile deja instalate și păstrăm starea funcțională.
5. Inspectăm tipul, arhitectura, runtime-ul, manifestul, dependențele și proveniența înainte de deployment.
6. Publisherul declarat și fișierul de semnătură nu sunt suficiente pentru a afirma autenticitatea.
7. Separăm instalarea, pornirea și gameplay-ul ca rezultate distincte; nu numim un joc funcțional până când pornește și poate fi jucat.
8. Notăm erorile exacte, instabilitatea și limitările de achiziție, cont, rețea sau servicii.
9. Nu redistribuim pachete de jocuri cu drepturi de autor fără să stabilim drepturile aplicabile.

## Necunoscute și pași următori

- Verificarea integrității APPX complet, inclusiv validarea block map-ului și legătura semnăturii cu pachetul.
- Identificarea unei referințe de hash independentă pentru exact acest APPX și verificarea potrivirii.
- Verificarea versiunilor de `Microsoft.Services.Store.Engagement` și `Microsoft.VCLibs.140.00` disponibile pe telefon, fără instalare.
- Confirmarea metodei de sideload APPX suportate pe Windows 10 Mobile 14393 înainte de a o folosi.
- Cercetarea compatibilității Minecraft 1.5.300 ARM cu Lumia 535; rezultatul rămâne necunoscut până la probă pe telefon.
- Reproducerea crash-ului Temple Run după relansare și după restart, fără să-l reclasificăm ca funcțional pe baza lansării unice.
- Recuperarea succesiunii exacte a upgrade-urilor Windows 10 Mobile și a detaliilor OUP.
- Recuperarea URL-urilor originale verificate pentru pachetele și procedurile proiectului.
- Identificarea și testarea pachetelor Jetpack Joyride, Subway Surfers și Fruit Ninja.

## Surse

Sursele externe susțin afirmațiile indicate; arhivele terțe sunt doar indicii de disponibilitate și nu certifică autenticitatea unui fișier local.

- [Microsoft Learn — Sideload line-of-business apps](https://learn.microsoft.com/en-us/windows/application-management/sideload-apps-in-windows): noțiuni de sideload, pachete semnate și certificat de încredere.
- [Microsoft Learn — Troubleshoot installation issues with App Installer](https://learn.microsoft.com/en-us/windows/msix/app-installer/troubleshoot-appinstaller-issues): disponibilitatea metodelor de instalare în funcție de build; buildul 14393 și `.appx` / `.appxbundle`.
- [Microsoft Learn — Sign an MSIX package](https://learn.microsoft.com/en-us/windows/msix/package/signing-package-overview): semnături, certificate, timestamp și verificarea conținutului prin block map și semnătură.
- [Microsoft Devices Blog — Minecraft: Pocket Edition now on Windows Phone](https://blogs.windows.com/devices/2014/12/10/minecraft-pocket-edition-now-windows-phone/): anunțul versiunii Windows Phone 8.1 și lista de telefoane menționată, inclusiv Lumia 535; nu dovedește compatibilitatea acestui APPX UWP.
- [WindowsViet — Minecraft: Pocket Edition](https://file.windowsviet.com/minecraft-pocket-edition/): pagină de arhivă care listează versiunea 1.5.300.0; nu este validare independentă a pachetului local.
- [PocketPC Software Archive — Windows 10 Mobile Apps](https://files.pocketpc-archive.com/Windows%2010%20Mobile%20Apps/): arhivă terță care listează pachetul Minecraft 1.5.300.0; nu este validare de semnătură sau proveniență.

Pentru fiecare informație nouă adăugată, păstrăm sursa și data consultării. Dacă sursa este o experiență de forum sau o arhivă neoficială, o etichetăm ca atare și nu o prezentăm ca fapt confirmat de Microsoft.
