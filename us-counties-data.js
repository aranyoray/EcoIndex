// US Counties Dataset - Representative sample across all 50 states
// Format: { name, state, lat, lon, population }
const usCounties = [
    // Alabama
    { name: "Jefferson County", state: "Alabama", lat: 33.5207, lon: -86.8025, population: 658573 },
    { name: "Mobile County", state: "Alabama", lat: 30.6944, lon: -88.0431, population: 414809 },
    { name: "Madison County", state: "Alabama", lat: 34.7304, lon: -86.5861, population: 388153 },
    { name: "Montgomery County", state: "Alabama", lat: 32.3668, lon: -86.3000, population: 227394 },
    { name: "Shelby County", state: "Alabama", lat: 33.3043, lon: -86.6861, population: 223024 },

    // Alaska
    { name: "Anchorage Municipality", state: "Alaska", lat: 61.2181, lon: -149.9003, population: 291247 },
    { name: "Fairbanks North Star Borough", state: "Alaska", lat: 64.8378, lon: -147.7164, population: 96849 },
    { name: "Matanuska-Susitna Borough", state: "Alaska", lat: 61.5819, lon: -149.4394, population: 107081 },

    // Arizona
    { name: "Maricopa County", state: "Arizona", lat: 33.4484, lon: -112.0740, population: 4485414 },
    { name: "Pima County", state: "Arizona", lat: 32.2226, lon: -110.9747, population: 1043433 },
    { name: "Pinal County", state: "Arizona", lat: 33.0384, lon: -111.5649, population: 462716 },
    { name: "Yavapai County", state: "Arizona", lat: 34.5400, lon: -112.4685, population: 236978 },
    { name: "Yuma County", state: "Arizona", lat: 32.6927, lon: -114.6277, population: 213787 },

    // Arkansas
    { name: "Pulaski County", state: "Arkansas", lat: 34.7465, lon: -92.2896, population: 399125 },
    { name: "Benton County", state: "Arkansas", lat: 36.3729, lon: -94.2088, population: 284333 },
    { name: "Washington County", state: "Arkansas", lat: 36.0629, lon: -94.1574, population: 245871 },

    // California
    { name: "Los Angeles County", state: "California", lat: 34.0522, lon: -118.2437, population: 10014009 },
    { name: "San Diego County", state: "California", lat: 32.7157, lon: -117.1611, population: 3298634 },
    { name: "Orange County", state: "California", lat: 33.7175, lon: -117.8311, population: 3186989 },
    { name: "Riverside County", state: "California", lat: 33.9533, lon: -117.3962, population: 2470546 },
    { name: "San Bernardino County", state: "California", lat: 34.1083, lon: -117.2898, population: 2180085 },
    { name: "Santa Clara County", state: "California", lat: 37.3541, lon: -121.9552, population: 1936259 },
    { name: "Alameda County", state: "California", lat: 37.6017, lon: -121.7195, population: 1671329 },
    { name: "Sacramento County", state: "California", lat: 38.5816, lon: -121.4944, population: 1585055 },
    { name: "Contra Costa County", state: "California", lat: 37.9536, lon: -121.9018, population: 1153526 },
    { name: "Fresno County", state: "California", lat: 36.7378, lon: -119.7871, population: 1008654 },
    { name: "San Francisco County", state: "California", lat: 37.7749, lon: -122.4194, population: 873965 },
    { name: "Ventura County", state: "California", lat: 34.2746, lon: -119.2290, population: 846006 },
    { name: "San Mateo County", state: "California", lat: 37.4337, lon: -122.4014, population: 766573 },
    { name: "Kern County", state: "California", lat: 35.3733, lon: -119.0187, population: 909235 },
    { name: "San Joaquin County", state: "California", lat: 37.9357, lon: -121.2772, population: 779233 },

    // Colorado
    { name: "Denver County", state: "Colorado", lat: 39.7392, lon: -104.9903, population: 715522 },
    { name: "El Paso County", state: "Colorado", lat: 38.8339, lon: -104.8214, population: 730395 },
    { name: "Arapahoe County", state: "Colorado", lat: 39.6403, lon: -104.3150, population: 656590 },
    { name: "Jefferson County", state: "Colorado", lat: 39.5555, lon: -105.2211, population: 582910 },
    { name: "Adams County", state: "Colorado", lat: 39.8764, lon: -104.3267, population: 519572 },
    { name: "Larimer County", state: "Colorado", lat: 40.5853, lon: -105.0844, population: 356899 },
    { name: "Boulder County", state: "Colorado", lat: 40.0150, lon: -105.2705, population: 330758 },

    // Connecticut
    { name: "Fairfield County", state: "Connecticut", lat: 41.2565, lon: -73.3709, population: 957419 },
    { name: "Hartford County", state: "Connecticut", lat: 41.7637, lon: -72.6851, population: 899498 },
    { name: "New Haven County", state: "Connecticut", lat: 41.3083, lon: -72.9279, population: 864835 },

    // Delaware
    { name: "New Castle County", state: "Delaware", lat: 39.6627, lon: -75.6006, population: 570719 },
    { name: "Sussex County", state: "Delaware", lat: 38.6912, lon: -75.3996, population: 237378 },
    { name: "Kent County", state: "Delaware", lat: 39.0728, lon: -75.5277, population: 181851 },

    // Florida
    { name: "Miami-Dade County", state: "Florida", lat: 25.7617, lon: -80.1918, population: 2716940 },
    { name: "Broward County", state: "Florida", lat: 26.1224, lon: -80.1373, population: 1952778 },
    { name: "Palm Beach County", state: "Florida", lat: 26.7153, lon: -80.0534, population: 1496770 },
    { name: "Hillsborough County", state: "Florida", lat: 27.9904, lon: -82.4582, population: 1459762 },
    { name: "Orange County", state: "Florida", lat: 28.5383, lon: -81.3792, population: 1429908 },
    { name: "Pinellas County", state: "Florida", lat: 27.9007, lon: -82.6778, population: 974996 },
    { name: "Duval County", state: "Florida", lat: 30.3322, lon: -81.6557, population: 995567 },
    { name: "Lee County", state: "Florida", lat: 26.6406, lon: -81.8723, population: 760822 },

    // Georgia
    { name: "Fulton County", state: "Georgia", lat: 33.7490, lon: -84.3880, population: 1063937 },
    { name: "Gwinnett County", state: "Georgia", lat: 33.9567, lon: -84.0043, population: 936250 },
    { name: "Cobb County", state: "Georgia", lat: 33.9698, lon: -84.5547, population: 766149 },
    { name: "DeKalb County", state: "Georgia", lat: 33.7707, lon: -84.2164, population: 764382 },
    { name: "Chatham County", state: "Georgia", lat: 32.0809, lon: -81.0912, population: 295291 },

    // Hawaii
    { name: "Honolulu County", state: "Hawaii", lat: 21.3099, lon: -157.8581, population: 1016508 },
    { name: "Hawaii County", state: "Hawaii", lat: 19.5429, lon: -155.6659, population: 200629 },
    { name: "Maui County", state: "Hawaii", lat: 20.8783, lon: -156.6825, population: 164754 },

    // Idaho
    { name: "Ada County", state: "Idaho", lat: 43.6150, lon: -116.2023, population: 481587 },
    { name: "Canyon County", state: "Idaho", lat: 43.6460, lon: -116.6873, population: 231105 },
    { name: "Kootenai County", state: "Idaho", lat: 47.6777, lon: -116.7805, population: 171362 },

    // Illinois
    { name: "Cook County", state: "Illinois", lat: 41.8781, lon: -87.6298, population: 5275541 },
    { name: "DuPage County", state: "Illinois", lat: 41.8519, lon: -88.0817, population: 932877 },
    { name: "Lake County", state: "Illinois", lat: 42.2997, lon: -87.8447, population: 714342 },
    { name: "Will County", state: "Illinois", lat: 41.4619, lon: -88.0817, population: 696355 },
    { name: "Kane County", state: "Illinois", lat: 41.9364, lon: -88.4254, population: 530315 },

    // Indiana
    { name: "Marion County", state: "Indiana", lat: 39.7684, lon: -86.1581, population: 964582 },
    { name: "Lake County", state: "Indiana", lat: 41.4789, lon: -87.3946, population: 485493 },
    { name: "Allen County", state: "Indiana", lat: 41.0797, lon: -85.1394, population: 385410 },
    { name: "Hamilton County", state: "Indiana", lat: 40.0581, lon: -86.0233, population: 347467 },

    // Iowa
    { name: "Polk County", state: "Iowa", lat: 41.5868, lon: -93.6250, population: 492401 },
    { name: "Linn County", state: "Iowa", lat: 42.0780, lon: -91.6656, population: 230299 },
    { name: "Scott County", state: "Iowa", lat: 41.6106, lon: -90.5771, population: 174669 },

    // Kansas
    { name: "Johnson County", state: "Kansas", lat: 38.8672, lon: -94.8201, population: 609863 },
    { name: "Sedgwick County", state: "Kansas", lat: 37.6872, lon: -97.3301, population: 523824 },
    { name: "Shawnee County", state: "Kansas", lat: 39.0473, lon: -95.6752, population: 178909 },

    // Kentucky
    { name: "Jefferson County", state: "Kentucky", lat: 38.2527, lon: -85.7585, population: 782969 },
    { name: "Fayette County", state: "Kentucky", lat: 38.0406, lon: -84.5037, population: 323780 },
    { name: "Kenton County", state: "Kentucky", lat: 39.0092, lon: -84.5186, population: 169064 },

    // Louisiana
    { name: "East Baton Rouge Parish", state: "Louisiana", lat: 30.4515, lon: -91.1871, population: 456781 },
    { name: "Jefferson Parish", state: "Louisiana", lat: 29.9547, lon: -90.0701, population: 440781 },
    { name: "Orleans Parish", state: "Louisiana", lat: 29.9511, lon: -90.0715, population: 390144 },
    { name: "St. Tammany Parish", state: "Louisiana", lat: 30.4088, lon: -89.9795, population: 264570 },

    // Maine
    { name: "Cumberland County", state: "Maine", lat: 43.7849, lon: -70.3261, population: 303069 },
    { name: "York County", state: "Maine", lat: 43.4629, lon: -70.6453, population: 211972 },
    { name: "Penobscot County", state: "Maine", lat: 45.0503, lon: -68.7615, population: 151748 },

    // Maryland
    { name: "Montgomery County", state: "Maryland", lat: 39.1434, lon: -77.2014, population: 1062061 },
    { name: "Prince George's County", state: "Maryland", lat: 38.8324, lon: -76.8519, population: 967201 },
    { name: "Baltimore County", state: "Maryland", lat: 39.4043, lon: -76.6197, population: 854535 },
    { name: "Anne Arundel County", state: "Maryland", lat: 38.9784, lon: -76.5492, population: 588261 },
    { name: "Howard County", state: "Maryland", lat: 39.2038, lon: -76.8610, population: 332317 },
    { name: "Baltimore City", state: "Maryland", lat: 39.2904, lon: -76.6122, population: 593490 },

    // Massachusetts
    { name: "Middlesex County", state: "Massachusetts", lat: 42.4862, lon: -71.3870, population: 1632002 },
    { name: "Worcester County", state: "Massachusetts", lat: 42.3626, lon: -71.8023, population: 862111 },
    { name: "Suffolk County", state: "Massachusetts", lat: 42.3601, lon: -71.0589, population: 803907 },
    { name: "Essex County", state: "Massachusetts", lat: 42.6334, lon: -70.8730, population: 809829 },

    // Michigan
    { name: "Wayne County", state: "Michigan", lat: 42.3314, lon: -83.0458, population: 1793561 },
    { name: "Oakland County", state: "Michigan", lat: 42.6611, lon: -83.3875, population: 1274395 },
    { name: "Macomb County", state: "Michigan", lat: 42.6698, lon: -82.9179, population: 881217 },
    { name: "Kent County", state: "Michigan", lat: 43.0209, lon: -85.6681, population: 657974 },
    { name: "Genesee County", state: "Michigan", lat: 43.0236, lon: -83.6875, population: 406211 },

    // Minnesota
    { name: "Hennepin County", state: "Minnesota", lat: 44.9778, lon: -93.2650, population: 1281565 },
    { name: "Ramsey County", state: "Minnesota", lat: 44.9537, lon: -93.0900, population: 542303 },
    { name: "Dakota County", state: "Minnesota", lat: 44.6728, lon: -93.0606, population: 439882 },
    { name: "Anoka County", state: "Minnesota", lat: 45.2768, lon: -93.2427, population: 363887 },

    // Mississippi
    { name: "Hinds County", state: "Mississippi", lat: 32.2988, lon: -90.1848, population: 227742 },
    { name: "Harrison County", state: "Mississippi", lat: 30.4169, lon: -89.0703, population: 208621 },
    { name: "DeSoto County", state: "Mississippi", lat: 34.8498, lon: -90.0209, population: 185314 },

    // Missouri
    { name: "St. Louis County", state: "Missouri", lat: 38.6270, lon: -90.1994, population: 1004125 },
    { name: "Jackson County", state: "Missouri", lat: 39.0997, lon: -94.5786, population: 717204 },
    { name: "St. Charles County", state: "Missouri", lat: 38.7881, lon: -90.6298, population: 405262 },
    { name: "St. Louis City", state: "Missouri", lat: 38.6270, lon: -90.1994, population: 301578 },

    // Montana
    { name: "Yellowstone County", state: "Montana", lat: 45.7833, lon: -108.5007, population: 161300 },
    { name: "Missoula County", state: "Montana", lat: 46.8721, lon: -113.9940, population: 119600 },
    { name: "Gallatin County", state: "Montana", lat: 45.6769, lon: -111.0429, population: 118960 },

    // Nebraska
    { name: "Douglas County", state: "Nebraska", lat: 41.2565, lon: -96.0103, population: 584526 },
    { name: "Lancaster County", state: "Nebraska", lat: 40.8136, lon: -96.7026, population: 322608 },
    { name: "Sarpy County", state: "Nebraska", lat: 41.1096, lon: -96.1489, population: 190604 },

    // Nevada
    { name: "Clark County", state: "Nevada", lat: 36.1699, lon: -115.1398, population: 2265461 },
    { name: "Washoe County", state: "Nevada", lat: 39.5296, lon: -119.8138, population: 486492 },

    // New Hampshire
    { name: "Hillsborough County", state: "New Hampshire", lat: 42.9097, lon: -71.6887, population: 422937 },
    { name: "Rockingham County", state: "New Hampshire", lat: 42.9814, lon: -71.0531, population: 326073 },
    { name: "Merrimack County", state: "New Hampshire", lat: 43.3396, lon: -71.7179, population: 153808 },

    // New Jersey
    { name: "Bergen County", state: "New Jersey", lat: 40.9604, lon: -74.0754, population: 955732 },
    { name: "Middlesex County", state: "New Jersey", lat: 40.4189, lon: -74.3823, population: 863162 },
    { name: "Essex County", state: "New Jersey", lat: 40.7843, lon: -74.2240, population: 863728 },
    { name: "Hudson County", state: "New Jersey", lat: 40.7453, lon: -74.0446, population: 724854 },
    { name: "Monmouth County", state: "New Jersey", lat: 40.2961, lon: -74.1677, population: 643615 },

    // New Mexico
    { name: "Bernalillo County", state: "New Mexico", lat: 35.0844, lon: -106.6504, population: 679121 },
    { name: "Dona Ana County", state: "New Mexico", lat: 32.3199, lon: -106.7637, population: 219561 },
    { name: "Santa Fe County", state: "New Mexico", lat: 35.6870, lon: -105.9378, population: 154823 },

    // New York
    { name: "Kings County (Brooklyn)", state: "New York", lat: 40.6782, lon: -73.9442, population: 2736074 },
    { name: "Queens County", state: "New York", lat: 40.7282, lon: -73.7949, population: 2405464 },
    { name: "New York County (Manhattan)", state: "New York", lat: 40.7128, lon: -74.0060, population: 1694251 },
    { name: "Bronx County", state: "New York", lat: 40.8448, lon: -73.8648, population: 1472654 },
    { name: "Richmond County (Staten Island)", state: "New York", lat: 40.5795, lon: -74.1502, population: 495747 },
    { name: "Nassau County", state: "New York", lat: 40.7128, lon: -73.5893, population: 1395774 },
    { name: "Suffolk County", state: "New York", lat: 40.9849, lon: -72.6151, population: 1525920 },
    { name: "Westchester County", state: "New York", lat: 41.1220, lon: -73.7949, population: 1004457 },
    { name: "Erie County", state: "New York", lat: 42.8864, lon: -78.8784, population: 954236 },

    // North Carolina
    { name: "Mecklenburg County", state: "North Carolina", lat: 35.2271, lon: -80.8431, population: 1110356 },
    { name: "Wake County", state: "North Carolina", lat: 35.7796, lon: -78.6382, population: 1129410 },
    { name: "Guilford County", state: "North Carolina", lat: 36.0726, lon: -79.7920, population: 541299 },
    { name: "Forsyth County", state: "North Carolina", lat: 36.0999, lon: -80.2442, population: 382590 },
    { name: "Durham County", state: "North Carolina", lat: 35.9940, lon: -78.8986, population: 324833 },

    // North Dakota
    { name: "Cass County", state: "North Dakota", lat: 46.8772, lon: -97.0329, population: 184525 },
    { name: "Burleigh County", state: "North Dakota", lat: 46.8083, lon: -100.7837, population: 98458 },
    { name: "Grand Forks County", state: "North Dakota", lat: 47.9253, lon: -97.0329, population: 73170 },

    // Ohio
    { name: "Cuyahoga County", state: "Ohio", lat: 41.4993, lon: -81.6944, population: 1280122 },
    { name: "Franklin County", state: "Ohio", lat: 39.9612, lon: -82.9988, population: 1323807 },
    { name: "Hamilton County", state: "Ohio", lat: 39.1031, lon: -84.5120, population: 830639 },
    { name: "Summit County", state: "Ohio", lat: 41.1084, lon: -81.5318, population: 540428 },
    { name: "Montgomery County", state: "Ohio", lat: 39.7589, lon: -84.1916, population: 532331 },

    // Oklahoma
    { name: "Oklahoma County", state: "Oklahoma", lat: 35.4676, lon: -97.5164, population: 796292 },
    { name: "Tulsa County", state: "Oklahoma", lat: 36.1540, lon: -95.9928, population: 669279 },
    { name: "Cleveland County", state: "Oklahoma", lat: 35.2226, lon: -97.3428, population: 295528 },

    // Oregon
    { name: "Multnomah County", state: "Oregon", lat: 45.5152, lon: -122.6784, population: 815428 },
    { name: "Washington County", state: "Oregon", lat: 45.5370, lon: -122.9906, population: 601561 },
    { name: "Clackamas County", state: "Oregon", lat: 45.4060, lon: -122.5706, population: 421401 },
    { name: "Lane County", state: "Oregon", lat: 44.0521, lon: -123.0868, population: 382067 },

    // Pennsylvania
    { name: "Philadelphia County", state: "Pennsylvania", lat: 39.9526, lon: -75.1652, population: 1603797 },
    { name: "Allegheny County", state: "Pennsylvania", lat: 40.4406, lon: -79.9959, population: 1250578 },
    { name: "Montgomery County", state: "Pennsylvania", lat: 40.2085, lon: -75.3813, population: 856553 },
    { name: "Bucks County", state: "Pennsylvania", lat: 40.3382, lon: -75.1327, population: 646538 },
    { name: "Delaware County", state: "Pennsylvania", lat: 39.9167, lon: -75.4102, population: 576830 },

    // Rhode Island
    { name: "Providence County", state: "Rhode Island", lat: 41.8240, lon: -71.4128, population: 660741 },
    { name: "Kent County", state: "Rhode Island", lat: 41.6705, lon: -71.5662, population: 170363 },
    { name: "Washington County", state: "Rhode Island", lat: 41.4015, lon: -71.5662, population: 129839 },

    // South Carolina
    { name: "Greenville County", state: "South Carolina", lat: 34.8526, lon: -82.3940, population: 525534 },
    { name: "Richland County", state: "South Carolina", lat: 34.0007, lon: -80.9535, population: 416147 },
    { name: "Charleston County", state: "South Carolina", lat: 32.7765, lon: -79.9311, population: 408235 },
    { name: "Horry County", state: "South Carolina", lat: 33.8361, lon: -78.9869, population: 351029 },

    // South Dakota
    { name: "Minnehaha County", state: "South Dakota", lat: 43.6911, lon: -96.7090, population: 197214 },
    { name: "Pennington County", state: "South Dakota", lat: 44.0805, lon: -103.2310, population: 109222 },
    { name: "Lincoln County", state: "South Dakota", lat: 43.4547, lon: -96.7440, population: 65161 },

    // Tennessee
    { name: "Shelby County", state: "Tennessee", lat: 35.1495, lon: -90.0490, population: 927644 },
    { name: "Davidson County", state: "Tennessee", lat: 36.1627, lon: -86.7816, population: 715884 },
    { name: "Knox County", state: "Tennessee", lat: 35.9606, lon: -83.9207, population: 478971 },
    { name: "Hamilton County", state: "Tennessee", lat: 35.0456, lon: -85.2097, population: 366207 },

    // Texas
    { name: "Harris County", state: "Texas", lat: 29.7604, lon: -95.3698, population: 4731145 },
    { name: "Dallas County", state: "Texas", lat: 32.7767, lon: -96.7970, population: 2647224 },
    { name: "Tarrant County", state: "Texas", lat: 32.7555, lon: -97.3308, population: 2110640 },
    { name: "Bexar County", state: "Texas", lat: 29.4241, lon: -98.4936, population: 2009324 },
    { name: "Travis County", state: "Texas", lat: 30.2672, lon: -97.7431, population: 1318514 },
    { name: "Collin County", state: "Texas", lat: 33.1972, lon: -96.6397, population: 1064465 },
    { name: "Hidalgo County", state: "Texas", lat: 26.3004, lon: -98.1631, population: 870781 },
    { name: "El Paso County", state: "Texas", lat: 31.7619, lon: -106.4850, population: 865657 },
    { name: "Denton County", state: "Texas", lat: 33.2148, lon: -97.1331, population: 906422 },
    { name: "Fort Bend County", state: "Texas", lat: 29.5694, lon: -95.6897, population: 822779 },

    // Utah
    { name: "Salt Lake County", state: "Utah", lat: 40.7608, lon: -111.8910, population: 1185238 },
    { name: "Utah County", state: "Utah", lat: 40.2444, lon: -111.6608, population: 659399 },
    { name: "Davis County", state: "Utah", lat: 41.0395, lon: -112.0008, population: 362679 },
    { name: "Weber County", state: "Utah", lat: 41.2733, lon: -111.9738, population: 262711 },

    // Vermont
    { name: "Chittenden County", state: "Vermont", lat: 44.4759, lon: -73.2121, population: 169291 },
    { name: "Rutland County", state: "Vermont", lat: 43.6106, lon: -72.9726, population: 58536 },
    { name: "Washington County", state: "Vermont", lat: 44.2802, lon: -72.5754, population: 59807 },

    // Virginia
    { name: "Fairfax County", state: "Virginia", lat: 38.8462, lon: -77.3064, population: 1150309 },
    { name: "Prince William County", state: "Virginia", lat: 38.7296, lon: -77.4728, population: 482204 },
    { name: "Virginia Beach City", state: "Virginia", lat: 36.8529, lon: -75.9780, population: 459470 },
    { name: "Loudoun County", state: "Virginia", lat: 39.0438, lon: -77.6474, population: 421936 },
    { name: "Henrico County", state: "Virginia", lat: 37.5407, lon: -77.4360, population: 334389 },

    // Washington
    { name: "King County", state: "Washington", lat: 47.6062, lon: -122.3321, population: 2269675 },
    { name: "Pierce County", state: "Washington", lat: 47.2529, lon: -122.4443, population: 921130 },
    { name: "Snohomish County", state: "Washington", lat: 48.0476, lon: -121.7295, population: 827957 },
    { name: "Spokane County", state: "Washington", lat: 47.6588, lon: -117.4260, population: 539339 },
    { name: "Clark County", state: "Washington", lat: 45.6387, lon: -122.4014, population: 503311 },

    // West Virginia
    { name: "Kanawha County", state: "West Virginia", lat: 38.3498, lon: -81.6326, population: 180745 },
    { name: "Berkeley County", state: "West Virginia", lat: 39.4764, lon: -77.9841, population: 122076 },
    { name: "Cabell County", state: "West Virginia", lat: 38.4192, lon: -82.2957, population: 94350 },

    // Wisconsin
    { name: "Milwaukee County", state: "Wisconsin", lat: 43.0389, lon: -87.9065, population: 945726 },
    { name: "Dane County", state: "Wisconsin", lat: 43.0731, lon: -89.4012, population: 561504 },
    { name: "Waukesha County", state: "Wisconsin", lat: 43.0117, lon: -88.2315, population: 406978 },
    { name: "Brown County", state: "Wisconsin", lat: 44.5133, lon: -87.9784, population: 268740 },

    // Wyoming
    { name: "Laramie County", state: "Wyoming", lat: 41.1400, lon: -104.8202, population: 100512 },
    { name: "Natrona County", state: "Wyoming", lat: 42.8666, lon: -106.3131, population: 79955 },
    { name: "Campbell County", state: "Wyoming", lat: 44.2883, lon: -105.5108, population: 47026 }
];
