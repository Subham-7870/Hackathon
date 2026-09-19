# Maintenance map location basis

The sample sectors are represented as real intercity railway corridors using their named station endpoints. The map will place markers at the station-city locations and draw a corridor between them:

| Sector code | Corridor represented on the map |
| --- | --- |
| SEC-NDLS-CNB-01 | New Delhi (NDLS) to Kanpur Central (CNB) |
| SEC-HWH-BWN-02 | Howrah (HWH) to Barddhaman (BWN) |
| SEC-BCT-BRC-03 | Mumbai Central (BCT) to Vadodara (BRC) |
| SEC-MAS-BZA-01 | Chennai Central (MAS) to Vijayawada (BZA) |
| SEC-SBC-MYS-01 | KSR Bengaluru City (SBC) to Mysuru (MYS) |

The current request data contains sector/corridor identifiers, not a surveyed track kilometre, geofence, or work-site coordinate. The map must therefore label each line as an **approximate corridor location** and must not imply that the displayed line is an exact track alignment or maintenance-chainage position. A production integration should replace these representative station coordinates with the confirmed work-site latitude/longitude or track kilometre from the maintenance record.

## References

1. [Indian Railways Station Search](https://claims.indianrail.gov.in/claims/claims.stnhelp?btnGo=Go&txtlocal=frmRR.txtstnto&txtstnname=)
2. [ixigo Indian Railway Station List](https://www.ixigo.com/train-stations)

## Rail-aligned route geometry source

OpenStreetMap railway route relations assemble the physical rail infrastructure elements associated with a line. The Overpass API is a read-only query service for selecting geometry from OpenStreetMap data. The map update will use rail-tagged OpenStreetMap geometry as its basis, then simplify it to lightweight polyline coordinates suitable for a static front-end map.

The integrated route file was generated from `railway=rail` ways in bounded corridor extracts for each of the five station pairs. A shortest connected path is calculated on that railway graph from the rail node nearest each displayed station endpoint, then simplified with a conservative geometric tolerance for browser performance. The plotted line is therefore rail-aligned rather than a straight geographic chord; it remains a planning-context layer, not an operational authority for route setting or exact maintenance-chainage control.

3. [OpenStreetMap Wiki — `route=railway`](https://wiki.openstreetmap.org/wiki/Tag:route%3Drailway)
4. [OpenStreetMap Wiki — Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API)
