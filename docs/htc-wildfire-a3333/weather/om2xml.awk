BEGIN {
    FS = ","
    mode = 0
    n = 0
    split("SAT SUN MON TUE WED THU FRI", dn, " ")
}

function zeller(y, m, d,   yy, cc, tt) {
    if (m < 3) { m += 12; y -= 1 }
    yy = y % 100
    cc = int(y / 100)
    tt = (d + int(13 * (m + 1) / 5) + yy + int(yy / 4) + int(cc / 4) - 2 * cc) % 7
    if (tt < 0) tt += 7
    return tt
}

function roundf(x) {
    return int(x + (x >= 0 ? 0.5 : -0.5))
}

function c(f) {
    return int((f - 32) * 5 / 9 + (f >= 32 ? 0.5 : -0.5))
}

function icon(wmo, day) {
    if (wmo == 0) return day ? 1 : 33
    if (wmo == 1) return day ? 2 : 34
    if (wmo == 2) return day ? 3 : 35
    if (wmo == 3) return 7
    if (wmo == 45 || wmo == 48) return 11
    if (wmo >= 51 && wmo <= 55) return day ? 12 : 39
    if (wmo == 56 || wmo == 57) return 26
    if (wmo >= 61 && wmo <= 65) return 18
    if (wmo == 66 || wmo == 67) return 26
    if (wmo >= 71 && wmo <= 77) return 22
    if (wmo >= 80 && wmo <= 82) return day ? 14 : 39
    if (wmo == 85 || wmo == 86) return day ? 21 : 43
    if (wmo == 95) return 15
    if (wmo == 96 || wmo == 99) return 17
    return day ? 1 : 33
}

$0 ~ /^time,temperature_2m/ { mode = 1; next }
$0 ~ /^time,weather_code/ { mode = 2; next }

mode == 1 && NF >= 4 {
    cur_time = $1
    cur_f = $2 + 0
    cur_day = $3 + 0
    cur_wmo = $4 + 0
    mode = 0
    next
}

mode == 2 && NF >= 4 {
    n++
    date[n] = $1
    wmo[n] = $2 + 0
    hi[n] = $3 + 0
    lo[n] = $4 + 0
    next
}

END {
    printf "<?xml version='1.0' encoding='iso-8859-1'?>\n"
    printf "<weather>\n"
    printf "  <current>\n"
    printf "    <temp c=\"%d\" f=\"%d\" />\n", c(cur_f), roundf(cur_f)
    printf "    <condition icon=\"%d\" />\n", icon(cur_wmo, cur_day)
    printf "  </current>\n"
    printf "  <forecast>\n"
    for (i = 1; i <= n && i <= 5; i++) {
        split(date[i], d, "-")
        y = d[1] + 0
        m = d[2] + 0
        dd = d[3] + 0
        t = zeller(y, m, dd)
        printf "    <day>\n"
        printf "      <name>%s</name>\n", dn[t + 1]
        printf "      <date>%02d/%02d/%02d</date>\n", m, dd, y % 100
        printf "      <condition icon=\"%d\" />\n", icon(wmo[i], 1)
        printf "      <high c=\"%d\" f=\"%d\" />\n", c(hi[i]), roundf(hi[i])
        printf "      <low c=\"%d\" f=\"%d\" />\n", c(lo[i]), roundf(lo[i])
        printf "    </day>\n"
    }
    printf "  </forecast>\n"
    printf "  <source>Open-Meteo (open-meteo.com)</source>\n"
    printf "</weather>\n"
}
