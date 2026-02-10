const DATA = {"heroes":[{"key":"ana","name":"Ana","portrait":"https://d15f34w2p8l1cc.cloudfront.net/overwatch/3429c394716364bbef802180e9763d04812757c205e1b4568bc321772096ed86.png","role":"support"},{"key":"ashe","name":"Ashe","portrait":"https://d15f34w2p8l1cc.cloudfront.net/overwatch/8dc2a024c9b7d95c7141b2ef065590dbc8d9018d12ad15f76b01923986702228.png","role":"damage"},{"key":"baptiste","name":"Baptiste","portrait":"https://d15f34w2p8l1cc.cloudfront.net/overwatch/f979896f74ba22db2a92a85ae1260124ab0a26665957a624365e0f96e5ac5b5c.png","role":"support"},{"key":"bastion","name":"Bastion","portrait":"https://d15f34w2p8l1cc.cloudfront.net/overwatch/4d715f722c42215072b5dd0240904aaed7b5285df0b2b082d0a7f1865b5ea992.png","role":"damage"},{"key":"brigitte","name":"Brigitte","portrait":"https://d15f34w2p8l1cc.cloudfront.net/overwatch/48392820c6976ee1cd8dde13e71df85bf15560083ee5c8658fe7c298095d619a.png","role":"support"},{"key":"cassidy","name":"Cassidy","portrait":"https://d15f34w2p8l1cc.cloudfront.net/overwatch/6cfb48b5597b657c2eafb1277dc5eef4a07eae90c265fcd37ed798189619f0a5.png","role":"damage"},{"key":"doomfist","name":"Doomfist","portrait":"https://d15f34w2p8l1cc.cloudfront.net/overwatch/13750471c693c1a360eb19d5ace229c8599a729cd961d72ebee0e157657b7d18.png","role":"tank"},{"key":"dva","name":"D.Va","portrait":"https://d15f34w2p8l1cc.cloudfront.net/overwatch/ca114f72193e4d58a85c087e9409242f1a31e808cf4058678b8cbf767c2a9a0a.png","role":"tank"},{"key":"echo","name":"Echo","portrait":"https://d15f34w2p8l1cc.cloudfront.net/overwatch/f086bf235cc6b7f138609594218a8385c8e5f6405a39eceb0deb9afb429619fe.png","role":"damage"},{"key":"freja","name":"Freja","portrait":"https://d15f34w2p8l1cc.cloudfront.net/overwatch/5d1a515607b70f87fd391d0478fb4d706e31a7aebfbcb0edd2cfce04efad256c.png","role":"damage"},{"key":"genji","name":"Genji","portrait":"https://d15f34w2p8l1cc.cloudfront.net/overwatch/4edf5ea6d58c449a2aeb619a3fda9fff36a069dfbe4da8bc5d8ec1c758ddb8dc.png","role":"damage"},{"key":"hanzo","name":"Hanzo","portrait":"https://d15f34w2p8l1cc.cloudfront.net/overwatch/aecd8fa677f0093344fab7ccb7c37516c764df3f5ff339a5a845a030a27ba7e0.png","role":"damage"},{"key":"hazard","name":"Hazard","portrait":"https://d15f34w2p8l1cc.cloudfront.net/overwatch/612ae1e6d28125bd4d4d18c2c4e5b004936c094556239ed24a1c0a806410a020.png","role":"tank"},{"key":"illari","name":"Illari","portrait":"https://d15f34w2p8l1cc.cloudfront.net/overwatch/5ea986038f9d307bd4613d5e6f2c4c8e7f15f30ceeeabbdd7a06637a38f17e1f.png","role":"support"},{"key":"junker-queen","name":"Junker Queen","portrait":"https://d15f34w2p8l1cc.cloudfront.net/overwatch/b4fa5f937fe07ef56c78bca80be9602c062b8d4451692aecff50e2f68c5c6476.png","role":"tank"},{"key":"junkrat","name":"Junkrat","portrait":"https://d15f34w2p8l1cc.cloudfront.net/overwatch/037e3df083624e5480f8996821287479a375f62b470572a22773da0eaf9441d0.png","role":"damage"},{"key":"juno","name":"Juno","portrait":"https://d15f34w2p8l1cc.cloudfront.net/overwatch/585b2d60cbd3c271b6ad5ad0922537af0c6836fab6c89cb9979077f7bb0832b5.png","role":"support"},{"key":"kiriko","name":"Kiriko","portrait":"https://d15f34w2p8l1cc.cloudfront.net/overwatch/088aff2153bdfa426984b1d5c912f6af0ab313f0865a81be0edd114e9a2f79f9.png","role":"support"},{"key":"lifeweaver","name":"Lifeweaver","portrait":"https://d15f34w2p8l1cc.cloudfront.net/overwatch/39d4514f1b858bc228035b09d5a74ed41f8eeefc9a0d1873570b216ba04334df.png","role":"support"},{"key":"lucio","name":"Lúcio","portrait":"https://d15f34w2p8l1cc.cloudfront.net/overwatch/e2ff2527610a0fbe0c9956f80925123ef3e66c213003e29d37436de30b90e4e1.png","role":"support"},{"key":"mauga","name":"Mauga","portrait":"https://d15f34w2p8l1cc.cloudfront.net/overwatch/9ee3f5a62893091d575ec0a0d66df878597086374202c6fc7da2d63320a7d02e.png","role":"tank"},{"key":"mei","name":"Mei","portrait":"https://d15f34w2p8l1cc.cloudfront.net/overwatch/1533fcb0ee1d3f9586f84b4067c6f63eca3322c1c661f69bfb41cd9e4f4bcc11.png","role":"damage"},{"key":"mercy","name":"Mercy","portrait":"https://d15f34w2p8l1cc.cloudfront.net/overwatch/2508ddd39a178d5f6ae993ab43eeb3e7961e5a54a9507e6ae347381193f28943.png","role":"support"},{"key":"moira","name":"Moira","portrait":"https://d15f34w2p8l1cc.cloudfront.net/overwatch/000beeb5606e01497897fa9210dd3b1e78e1159ebfd8afdc9e989047d7d3d08f.png","role":"support"},{"key":"orisa","name":"Orisa","portrait":"https://d15f34w2p8l1cc.cloudfront.net/overwatch/71e96294617e81051d120b5d04b491bb1ea40e2933da44d6631aae149aac411d.png","role":"tank"},{"key":"pharah","name":"Pharah","portrait":"https://d15f34w2p8l1cc.cloudfront.net/overwatch/f8261595eca3e43e3b37cadb8161902cc416e38b7e0caa855f4555001156d814.png","role":"damage"},{"key":"ramattra","name":"Ramattra","portrait":"https://d15f34w2p8l1cc.cloudfront.net/overwatch/3e0367155e1940a24da076c6f1f065aacede88dbc323631491aa0cd5a51e0b66.png","role":"tank"},{"key":"reaper","name":"Reaper","portrait":"https://d15f34w2p8l1cc.cloudfront.net/overwatch/2edb9af69d987bb503cd31f7013ae693640e692b321a73d175957b9e64394f40.png","role":"damage"},{"key":"reinhardt","name":"Reinhardt","portrait":"https://d15f34w2p8l1cc.cloudfront.net/overwatch/490d2f79f8547d6e364306af60c8184fb8024b8e55809e4cc501126109981a65.png","role":"tank"},{"key":"roadhog","name":"Roadhog","portrait":"https://d15f34w2p8l1cc.cloudfront.net/overwatch/72e02e747b66b61fcbc02d35d350770b3ec7cbaabd0a7ca17c0d82743d43a7e8.png","role":"tank"},{"key":"sigma","name":"Sigma","portrait":"https://d15f34w2p8l1cc.cloudfront.net/overwatch/cd7a4c0a0df8924afb2c9f6df864ed040f20250440c36ca2eb634acf6609c5e4.png","role":"tank"},{"key":"sojourn","name":"Sojourn","portrait":"https://d15f34w2p8l1cc.cloudfront.net/overwatch/a53bf7ad9d2f33aaf9199a00989f86d4ba1f67c281ba550312c7d96e70fec4ea.png","role":"damage"},{"key":"soldier-76","name":"Soldier: 76","portrait":"https://d15f34w2p8l1cc.cloudfront.net/overwatch/20b4ef00ed05d6dba75df228241ed528df7b6c9556f04c8070bad1e2f89e0ff5.png","role":"damage"},{"key":"sombra","name":"Sombra","portrait":"https://d15f34w2p8l1cc.cloudfront.net/overwatch/bca8532688f01b071806063b9472f1c0f9fc9c7948e6b59e210006e69cec9022.png","role":"damage"},{"key":"symmetra","name":"Symmetra","portrait":"https://d15f34w2p8l1cc.cloudfront.net/overwatch/7f2024c5387c9d76d944a5db021c2774d1e9d7cbf39e9b6a35b364d38ea250ac.png","role":"damage"},{"key":"torbjorn","name":"Torbjörn","portrait":"https://d15f34w2p8l1cc.cloudfront.net/overwatch/1309ab1add1cc19189a2c8bc7b1471f88efa1073e9705d2397fdb37d45707d01.png","role":"damage"},{"key":"tracer","name":"Tracer","portrait":"https://d15f34w2p8l1cc.cloudfront.net/overwatch/a66413200e934da19540afac965cfe8a2de4ada593d9a52d53108bb28e8bbc9c.png","role":"damage"},{"key":"vendetta","name":"Vendetta","portrait":"https://d15f34w2p8l1cc.cloudfront.net/overwatch/62f32041c5bdcb11bdaff6581fee2a9a372d8f61e117b36a1dc8ff6d0c8a1ead.png","role":"damage"},{"key":"venture","name":"Venture","portrait":"https://d15f34w2p8l1cc.cloudfront.net/overwatch/5d87623006ccc77578396831d4629f91b5162235a553b3f442e1a43161898e94.png","role":"damage"},{"key":"widowmaker","name":"Widowmaker","portrait":"https://d15f34w2p8l1cc.cloudfront.net/overwatch/a714f1cb33cc91c6b5b3e89ffe7e325b99e7c89cc8e8feced594f81305147efe.png","role":"damage"},{"key":"winston","name":"Winston","portrait":"https://d15f34w2p8l1cc.cloudfront.net/overwatch/bd9c8e634d89488459dfc1aeb21b602fa5c39aa05601a4167682f3a3fed4e0ee.png","role":"tank"},{"key":"wrecking-ball","name":"Wrecking Ball","portrait":"https://d15f34w2p8l1cc.cloudfront.net/overwatch/5c18e39ce567ee8a84078f775b9f76a2ba891de601c059a3d2b46b61ae4afb42.png","role":"tank"},{"key":"wuyang","name":"Wuyang","portrait":"https://d15f34w2p8l1cc.cloudfront.net/overwatch/e4157a71bb307b4ca910d901773f43d187c22101c5f4284a0a5f3caba8ec4bdd.png","role":"support"},{"key":"zarya","name":"Zarya","portrait":"https://d15f34w2p8l1cc.cloudfront.net/overwatch/8819ba85823136640d8eba2af6fd7b19d46b9ee8ab192a4e06f396d1e5231f7a.png","role":"tank"},{"key":"zenyatta","name":"Zenyatta","portrait":"https://d15f34w2p8l1cc.cloudfront.net/overwatch/71cabc939c577581f66b952f9c70891db779251e8e70f29de3c7bf494edacfe4.png","role":"support"}],"roles":[{"key":"tank","name":"Tank","icon":"https://blz-contentstack-images.akamaized.net/v3/assets/blt2477dcaf4ebd440c/bltf0889daa1ef606db/6504cff74d2a764cb7973991/Tank.svg","description":"Tank heroes soak up damage and shatter fortified positions, like closely grouped enemies and narrow chokepoints. If you’re a tank, you lead the charge."},{"key":"damage","name":"Damage","icon":"https://blz-contentstack-images.akamaized.net/v3/assets/blt2477dcaf4ebd440c/blt05d482c88096959a/6504cff7d9caa1285f64b6bd/Damage.svg","description":"Damage heroes seek out, engage, and obliterate the enemy with wide-ranging tools, abilities, and play styles. Fearsome but fragile, these heroes require backup to survive."},{"key":"support","name":"Support","icon":"https://blz-contentstack-images.akamaized.net/v3/assets/blt2477dcaf4ebd440c/blt3ccd5df488163b33/6504cff7fc2ae4d7c50445c4/Support.svg","description":"Support heroes empower their allies by healing, shielding, boosting damage, and disabling foes. As a support, you’re the backbone of your team’s survival."}],"gamemodes":[{"key":"assault","name":"Assault","icon":"https://overfast-api.tekrop.fr/static/gamemodes/assault-icon.svg","description":"Teams fight to capture or defend two successive points against the enemy team. It's an inactive Overwatch 1 gamemode, also called 2CP.","screenshot":"https://overfast-api.tekrop.fr/static/gamemodes/assault.avif"},{"key":"capture-the-flag","name":"Capture the Flag","icon":"https://overfast-api.tekrop.fr/static/gamemodes/capture-the-flag-icon.svg","description":"Teams compete to capture the enemy team’s flag while defending their own.","screenshot":"https://overfast-api.tekrop.fr/static/gamemodes/capture-the-flag.avif"},{"key":"clash","name":"Clash","icon":"https://overfast-api.tekrop.fr/static/gamemodes/clash-icon.svg","description":"Vie for dominance across a series of capture points with dynamic spawns and linear map routes, so you spend less time running back to the battle and more time in the heart of it.","screenshot":"https://overfast-api.tekrop.fr/static/gamemodes/clash.avif"},{"key":"control","name":"Control","icon":"https://overfast-api.tekrop.fr/static/gamemodes/control-icon.svg","description":"Teams fight to hold a single objective. The first team to win two rounds wins the map.","screenshot":"https://overfast-api.tekrop.fr/static/gamemodes/control.avif"},{"key":"deathmatch","name":"Deathmatch","icon":"https://overfast-api.tekrop.fr/static/gamemodes/deathmatch-icon.svg","description":"Race to reach 20 points first by racking up kills in a free-for-all format.","screenshot":"https://overfast-api.tekrop.fr/static/gamemodes/deathmatch.avif"},{"key":"elimination","name":"Elimination","icon":"https://overfast-api.tekrop.fr/static/gamemodes/elimination-icon.svg","description":"Dispatch all enemies to win the round. Win three rounds to claim victory. Available with teams of one, three, or six.","screenshot":"https://overfast-api.tekrop.fr/static/gamemodes/elimination.avif"},{"key":"escort","name":"Escort","icon":"https://overfast-api.tekrop.fr/static/gamemodes/escort-icon.svg","description":"One team escorts a payload to its delivery point, while the other races to stop them.","screenshot":"https://overfast-api.tekrop.fr/static/gamemodes/escort.avif"},{"key":"flashpoint","name":"Flashpoint","icon":"https://overfast-api.tekrop.fr/static/gamemodes/flashpoint-icon.svg","description":"Teams fight across our biggest PVP maps to date, New Junk City and Suravasa, to seize control of five different objectives in a fast-paced, best-of-five battle!","screenshot":"https://overfast-api.tekrop.fr/static/gamemodes/flashpoint.avif"},{"key":"hybrid","name":"Hybrid","icon":"https://overfast-api.tekrop.fr/static/gamemodes/hybrid-icon.svg","description":"Attackers capture a payload, then escort it to its destination; defenders try to hold them back.","screenshot":"https://overfast-api.tekrop.fr/static/gamemodes/hybrid.avif"},{"key":"payload-race","name":"Payload Race","icon":"https://overfast-api.tekrop.fr/static/gamemodes/payload-race-icon.svg","description":"Both teams get a payload to escort to the ending location while preventing the enemies from doing the same.","screenshot":"https://overfast-api.tekrop.fr/static/gamemodes/payload-race.avif"},{"key":"practice-range","name":"Practice Range","icon":"https://overfast-api.tekrop.fr/static/gamemodes/practice-range-icon.svg","description":"Learn the basics, practice and test your settings.","screenshot":"https://overfast-api.tekrop.fr/static/gamemodes/practice-range.avif"},{"key":"push","name":"Push","icon":"https://overfast-api.tekrop.fr/static/gamemodes/push-icon.svg","description":"Teams battle to take control of a robot and push it toward the enemy base.","screenshot":"https://overfast-api.tekrop.fr/static/gamemodes/push.avif"},{"key":"team-deathmatch","name":"Team Deathmatch","icon":"https://overfast-api.tekrop.fr/static/gamemodes/team-deathmatch-icon.svg","description":"Team up and triumph over your enemies by scoring the most kills.","screenshot":"https://overfast-api.tekrop.fr/static/gamemodes/team-deathmatch.avif"},{"key":"workshop","name":"Workshop","icon":"https://overfast-api.tekrop.fr/static/gamemodes/workshop-icon.svg","description":"Experience custom and experimental gameplay, only in Custom Games.","screenshot":"https://overfast-api.tekrop.fr/static/gamemodes/workshop.avif"}],"maps":[{"key":"aatlis","name":"Aatlis","screenshot":"https://overfast-api.tekrop.fr/static/maps/aatlis.jpg","gamemodes":["flashpoint"],"location":"Morocco","country_code":"MA"},{"key":"antarctic-peninsula","name":"Antarctic Peninsula","screenshot":"https://overfast-api.tekrop.fr/static/maps/antarctic-peninsula.jpg","gamemodes":["control"],"location":"Antarctica","country_code":"AQ"},{"key":"anubis","name":"Temple of Anubis","screenshot":"https://overfast-api.tekrop.fr/static/maps/anubis.jpg","gamemodes":["assault"],"location":"Giza Plateau, Egypt","country_code":"EG"},{"key":"arena-victoriae","name":"Arena Victoriae","screenshot":"https://overfast-api.tekrop.fr/static/maps/arena-victoriae.jpg","gamemodes":["control"],"location":"Colosseo, Rome, Italy","country_code":"IT"},{"key":"ayutthaya","name":"Ayutthaya","screenshot":"https://overfast-api.tekrop.fr/static/maps/ayutthaya.jpg","gamemodes":["capture-the-flag"],"location":"Thailand","country_code":"TH"},{"key":"black-forest","name":"Black Forest","screenshot":"https://overfast-api.tekrop.fr/static/maps/black-forest.jpg","gamemodes":["elimination"],"location":"Germany","country_code":"DE"},{"key":"blizzard-world","name":"Blizzard World","screenshot":"https://overfast-api.tekrop.fr/static/maps/blizzard-world.jpg","gamemodes":["hybrid"],"location":"Irvine, California, United States","country_code":"US"},{"key":"busan","name":"Busan","screenshot":"https://overfast-api.tekrop.fr/static/maps/busan.jpg","gamemodes":["control"],"location":"South Korea","country_code":"KR"},{"key":"castillo","name":"Castillo","screenshot":"https://overfast-api.tekrop.fr/static/maps/castillo.jpg","gamemodes":["elimination"],"location":"Mexico","country_code":"MX"},{"key":"chateau-guillard","name":"Château Guillard","screenshot":"https://overfast-api.tekrop.fr/static/maps/chateau-guillard.jpg","gamemodes":["deathmatch","team-deathmatch"],"location":"Annecy, France","country_code":"FR"},{"key":"circuit-royal","name":"Circuit Royal","screenshot":"https://overfast-api.tekrop.fr/static/maps/circuit-royal.jpg","gamemodes":["escort"],"location":"Monte Carlo, Monaco","country_code":"MC"},{"key":"colosseo","name":"Colosseo","screenshot":"https://overfast-api.tekrop.fr/static/maps/colosseo.jpg","gamemodes":["push"],"location":"Rome, Italy","country_code":"IT"},{"key":"dorado","name":"Dorado","screenshot":"https://overfast-api.tekrop.fr/static/maps/dorado.jpg","gamemodes":["escort"],"location":"Mexico","country_code":"MX"},{"key":"ecopoint-antarctica","name":"Ecopoint: Antarctica","screenshot":"https://overfast-api.tekrop.fr/static/maps/ecopoint-antarctica.jpg","gamemodes":["elimination"],"location":"Antarctica","country_code":"AQ"},{"key":"eichenwalde","name":"Eichenwalde","screenshot":"https://overfast-api.tekrop.fr/static/maps/eichenwalde.jpg","gamemodes":["hybrid"],"location":"Stuttgart, Germany","country_code":"DE"},{"key":"esperanca","name":"Esperança","screenshot":"https://overfast-api.tekrop.fr/static/maps/esperanca.jpg","gamemodes":["push"],"location":"Portugal","country_code":"PT"},{"key":"gogadoro","name":"Gogadoro","screenshot":"https://overfast-api.tekrop.fr/static/maps/gogadoro.jpg","gamemodes":["control"],"location":"Busan, South Korea","country_code":"KR"},{"key":"hanamura","name":"Hanamura","screenshot":"https://overfast-api.tekrop.fr/static/maps/hanamura.jpg","gamemodes":["assault"],"location":"Tokyo, Japan","country_code":"JP"},{"key":"hanaoka","name":"Hanaoka","screenshot":"https://overfast-api.tekrop.fr/static/maps/hanaoka.jpg","gamemodes":["clash"],"location":"Tokyo, Japan","country_code":"JP"},{"key":"havana","name":"Havana","screenshot":"https://overfast-api.tekrop.fr/static/maps/havana.jpg","gamemodes":["escort"],"location":"Havana, Cuba","country_code":"CU"},{"key":"hollywood","name":"Hollywood","screenshot":"https://overfast-api.tekrop.fr/static/maps/hollywood.jpg","gamemodes":["hybrid"],"location":"Los Angeles, United States","country_code":"US"},{"key":"horizon","name":"Horizon Lunar Colony","screenshot":"https://overfast-api.tekrop.fr/static/maps/horizon.jpg","gamemodes":["assault"],"location":"Earth's moon","country_code":null},{"key":"ilios","name":"Ilios","screenshot":"https://overfast-api.tekrop.fr/static/maps/ilios.jpg","gamemodes":["control"],"location":"Greece","country_code":"GR"},{"key":"junkertown","name":"Junkertown","screenshot":"https://overfast-api.tekrop.fr/static/maps/junkertown.jpg","gamemodes":["escort"],"location":"Central Australia","country_code":"AU"},{"key":"lijiang-tower","name":"Lijiang Tower","screenshot":"https://overfast-api.tekrop.fr/static/maps/lijiang-tower.jpg","gamemodes":["control"],"location":"China","country_code":"CN"},{"key":"kanezaka","name":"Kanezaka","screenshot":"https://overfast-api.tekrop.fr/static/maps/kanezaka.jpg","gamemodes":["deathmatch","team-deathmatch"],"location":"Tokyo, Japan","country_code":"JP"},{"key":"kings-row","name":"King’s Row","screenshot":"https://overfast-api.tekrop.fr/static/maps/kings-row.jpg","gamemodes":["hybrid"],"location":"London, United Kingdom","country_code":"UK"},{"key":"malevento","name":"Malevento","screenshot":"https://overfast-api.tekrop.fr/static/maps/malevento.jpg","gamemodes":["deathmatch","team-deathmatch"],"location":"Italy","country_code":"IT"},{"key":"midtown","name":"Midtown","screenshot":"https://overfast-api.tekrop.fr/static/maps/midtown.jpg","gamemodes":["hybrid"],"location":"New York, United States","country_code":"US"},{"key":"necropolis","name":"Necropolis","screenshot":"https://overfast-api.tekrop.fr/static/maps/necropolis.jpg","gamemodes":["elimination"],"location":"Egypt","country_code":"EG"},{"key":"nepal","name":"Nepal","screenshot":"https://overfast-api.tekrop.fr/static/maps/nepal.jpg","gamemodes":["control"],"location":"Nepal","country_code":"NP"},{"key":"new-junk-city","name":"New Junk City","screenshot":"https://overfast-api.tekrop.fr/static/maps/new-junk-city.jpg","gamemodes":["flashpoint"],"location":"Central Australia","country_code":"AU"},{"key":"new-queen-street","name":"New Queen Street","screenshot":"https://overfast-api.tekrop.fr/static/maps/new-queen-street.jpg","gamemodes":["push"],"location":"Toronto, Canada","country_code":"CA"},{"key":"numbani","name":"Numbani","screenshot":"https://overfast-api.tekrop.fr/static/maps/numbani.jpg","gamemodes":["hybrid"],"location":"Numbani (near Nigeria)","country_code":null},{"key":"oasis","name":"Oasis","screenshot":"https://overfast-api.tekrop.fr/static/maps/oasis.jpg","gamemodes":["control"],"location":"Iraq","country_code":"IQ"},{"key":"paraiso","name":"Paraíso","screenshot":"https://overfast-api.tekrop.fr/static/maps/paraiso.jpg","gamemodes":["hybrid"],"location":"Rio de Janeiro, Brazil","country_code":"BR"},{"key":"paris","name":"Paris","screenshot":"https://overfast-api.tekrop.fr/static/maps/paris.jpg","gamemodes":["assault"],"location":"Paris, France","country_code":"FR"},{"key":"petra","name":"Petra","screenshot":"https://overfast-api.tekrop.fr/static/maps/petra.jpg","gamemodes":["deathmatch","team-deathmatch"],"location":"Southern Jordan","country_code":"JO"},{"key":"place-lacroix","name":"Place Lacroix","screenshot":"https://overfast-api.tekrop.fr/static/maps/place-lacroix.jpg","gamemodes":["push"],"location":"Paris, France","country_code":"FR"},{"key":"powder-keg-mine","name":"Powder Keg Mine","screenshot":"https://overfast-api.tekrop.fr/static/maps/powder-keg-mine.jpg","gamemodes":["payload-race"],"location":"Deadlock Gorge, Arizona, United States","country_code":"US"},{"key":"practice-range","name":"Practice Range","screenshot":"https://overfast-api.tekrop.fr/static/maps/practice-range.jpg","gamemodes":["practice-range"],"location":"Swiss HQ","country_code":"CH"},{"key":"redwood-dam","name":"Redwood Dam","screenshot":"https://overfast-api.tekrop.fr/static/maps/redwood-dam.jpg","gamemodes":["push"],"location":"Gibraltar","country_code":"GI"},{"key":"rialto","name":"Rialto","screenshot":"https://overfast-api.tekrop.fr/static/maps/rialto.jpg","gamemodes":["escort"],"location":"Venice, Italy","country_code":"IT"},{"key":"route-66","name":"Route 66","screenshot":"https://overfast-api.tekrop.fr/static/maps/route-66.jpg","gamemodes":["escort"],"location":"Albuquerque, New Mexico, United States","country_code":"US"},{"key":"runasapi","name":"Runasapi","screenshot":"https://overfast-api.tekrop.fr/static/maps/runasapi.jpg","gamemodes":["push"],"location":"Peru","country_code":"PE"},{"key":"samoa","name":"Samoa","screenshot":"https://overfast-api.tekrop.fr/static/maps/samoa.jpg","gamemodes":["control"],"location":"Samoa","country_code":"WS"},{"key":"shambali-monastery","name":"Shambali Monastery","screenshot":"https://overfast-api.tekrop.fr/static/maps/shambali-monastery.jpg","gamemodes":["escort"],"location":"Nepal","country_code":"NP"},{"key":"suravasa","name":"Suravasa","screenshot":"https://overfast-api.tekrop.fr/static/maps/suravasa.jpg","gamemodes":["flashpoint"],"location":"India","country_code":"IN"},{"key":"thames-district","name":"Thames District","screenshot":"https://overfast-api.tekrop.fr/static/maps/thames-district.jpg","gamemodes":["payload-race"],"location":"London, United Kingdom","country_code":"UK"},{"key":"throne-of-anubis","name":"Throne of Anubis","screenshot":"https://overfast-api.tekrop.fr/static/maps/throne-of-anubis.jpg","gamemodes":["clash"],"location":"Giza Plateau, Egypt","country_code":"EG"},{"key":"volskaya","name":"Volskaya Industries","screenshot":"https://overfast-api.tekrop.fr/static/maps/volskaya.jpg","gamemodes":["assault"],"location":"St. Petersburg, Russia","country_code":"RU"},{"key":"watchpoint-gibraltar","name":"Watchpoint: Gibraltar","screenshot":"https://overfast-api.tekrop.fr/static/maps/watchpoint-gibraltar.jpg","gamemodes":["escort"],"location":"Gibraltar","country_code":"GI"},{"key":"workshop-chamber","name":"Workshop Chamber","screenshot":"https://overfast-api.tekrop.fr/static/maps/workshop-chamber.jpg","gamemodes":["workshop"],"location":"Earth","country_code":null},{"key":"workshop-expanse","name":"Workshop Expanse","screenshot":"https://overfast-api.tekrop.fr/static/maps/workshop-expanse.jpg","gamemodes":["workshop"],"location":"Earth","country_code":null},{"key":"workshop-green-screen","name":"Workshop Green Screen","screenshot":"https://overfast-api.tekrop.fr/static/maps/workshop-green-screen.jpg","gamemodes":["workshop"],"location":"Earth","country_code":null},{"key":"workshop-island","name":"Workshop Island","screenshot":"https://overfast-api.tekrop.fr/static/maps/workshop-island.jpg","gamemodes":["workshop"],"location":"Earth","country_code":null},{"key":"wuxing-university","name":"Wuxing University","screenshot":"https://overfast-api.tekrop.fr/static/maps/wuxing-university.jpg","gamemodes":["control"],"location":"Chengdu, Sichuan, China","country_code":"CN"}],"buildInfo":{"generatedAt":"2026-02-10T04:28:22.601Z","usedCache":false}};
    const API_BASE_URL = "https://overfast-api.tekrop.fr";

    const state = {
        heroSearch: '',
        heroRole: 'all',
        mapSearch: '',
        gamemodeSearch: ''
    };

    function normalize(text) {
        return (text || '').toString().toLowerCase().trim();
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('underwatch-theme', theme);
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.textContent = theme === 'dark' ? 'Switch to Light' : 'Switch to Dark';
        }
    }

    function initTheme() {
        const stored = localStorage.getItem('underwatch-theme');
        if (stored) {
            setTheme(stored);
            return;
        }
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
    }

    function setActiveNav(sectionId) {
        document.querySelectorAll('.nav-link').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.section === sectionId);
        });
    }

    function showSection(sectionId) {
        document.querySelectorAll('section.content').forEach(section => {
            section.classList.add('hidden');
        });
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.remove('hidden');
            setActiveNav(sectionId);
            history.replaceState(null, '', '#' + sectionId);
        }
    }

    function applyHeroFilters() {
        const search = normalize(state.heroSearch);
        const role = state.heroRole;
        const cards = document.querySelectorAll('.hero-card');
        let visible = 0;

        cards.forEach(card => {
            const name = normalize(card.dataset.name);
            const cardRole = normalize(card.dataset.role);
            const matchesSearch = !search || name.includes(search);
            const matchesRole = role === 'all' || cardRole === role;
            const isVisible = matchesSearch && matchesRole;
            card.style.display = isVisible ? 'block' : 'none';
            if (isVisible) {
                visible += 1;
            }
        });

        const counter = document.getElementById('heroCount');
        if (counter) {
            counter.textContent = visible + ' heroes';
        }
    }

    function applyFilter(containerSelector, searchValue) {
        const search = normalize(searchValue);
        const cards = document.querySelectorAll(containerSelector);
        cards.forEach(card => {
            const name = normalize(card.dataset.name);
            card.style.display = !search || name.includes(search) ? '' : 'none';
        });
    }

    async function showHeroDetails(heroKey) {
        const hero = DATA.heroes.find(h => h.key === heroKey);
        if (!hero) return;

        const modal = document.getElementById('heroModal');
        const modalHeroName = document.getElementById('modalHeroName');
        const modalHeroDetails = document.getElementById('modalHeroDetails');

        modalHeroName.textContent = hero.name + ' | ' + hero.role.charAt(0).toUpperCase() + hero.role.slice(1);
        modalHeroDetails.innerHTML = '<div class="status">Loading details...</div>';
        modal.classList.remove('hidden');
        modal.setAttribute('aria-hidden', 'false');

        try {
            const response = await fetch(API_BASE_URL + '/heroes/' + heroKey);
            if (!response.ok) {
                throw new Error('Hero details unavailable');
            }
            const details = await response.json();
            const storyChapters = details.story && details.story.chapters ? details.story.chapters : [];
            const maxLoreParagraphs = 2;
            const fullLoreHtml = storyChapters.length
                ? storyChapters.map(chapter => '<p>' + escapeHtml(chapter.content) + '</p>').join('')
                : '<p class="muted">Lore not available.</p>';
            const collapsedLoreHtml = storyChapters.length
                ? storyChapters.slice(0, maxLoreParagraphs).map(chapter => '<p>' + escapeHtml(chapter.content) + '</p>').join('')
                : '<p class="muted">Lore not available.</p>';
            const hasMoreLore = storyChapters.length > maxLoreParagraphs;

            const abilities = (details.abilities || []).map((ability, index) => {
                const iconMarkup = ability.icon
                    ? (index === 0
                            ? '<img src="' + ability.icon + '" alt="' + escapeHtml(ability.name) + ' icon" class="ability-wide-image">'
                            : '<img src="' + ability.icon + '" alt="' + escapeHtml(ability.name) + ' icon" class="ability-image">')
                    : '';
                return (
                    '<div class="ability-box">' +
                        '<div class="ability-header">' + escapeHtml(ability.name) + '</div>' +
                        '<div class="ability-details">' +
                            iconMarkup +
                            '<div>' + escapeHtml(ability.description) + '</div>' +
                        '</div>' +
                    '</div>'
                );
            }).join('');

            modalHeroDetails.innerHTML =
                '<div class="hero-description">' + escapeHtml(details.description) + '</div>' +
                '<h3 class="text-xl font-bold mt-4">Abilities</h3>' +
                (abilities || '<p class="muted">No abilities listed.</p>') +
                '<h3 class="text-xl font-bold mt-4">Lore</h3>' +
                '<div class="hero-lore" id="heroLore">' + collapsedLoreHtml + '</div>' +
                (hasMoreLore
                    ? '<button type="button" id="loreToggle" class="btn btn-secondary lore-toggle">Show more</button>'
                    : '');

            if (hasMoreLore) {
                const loreToggle = document.getElementById('loreToggle');
                const loreContainer = document.getElementById('heroLore');
                let expanded = false;
                if (loreToggle && loreContainer) {
                    loreToggle.addEventListener('click', () => {
                        expanded = !expanded;
                        loreContainer.innerHTML = expanded ? fullLoreHtml : collapsedLoreHtml;
                        loreToggle.textContent = expanded ? 'Show less' : 'Show more';
                    });
                }
            }
        } catch (error) {
            console.error('Error loading hero details:', error);
            modalHeroDetails.innerHTML = '<div class="status">Error loading hero details.</div>';
        }
    }

    function closeModal() {
        const modal = document.getElementById('heroModal');
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
    }

    function formatBattleTag(value) {
        return value.trim().replace('#', '-');
    }

    async function searchPlayer() {
        const playerInput = document.getElementById('playerInput');
        const resultDiv = document.getElementById('playerResult');
        if (!playerInput || !resultDiv) return;

        const rawValue = playerInput.value;
        if (!rawValue.trim()) {
            resultDiv.innerHTML = '<div class="status">Please enter a BattleTag (e.g. Player#1234).</div>';
            return;
        }

        const playerIdFormatted = formatBattleTag(rawValue);
        resultDiv.innerHTML = '<div class="status">Searching...</div>';

        try {
            const response = await fetch(API_BASE_URL + '/players/' + playerIdFormatted);
            if (!response.ok) {
                throw new Error('Player not found');
            }
            const player = await response.json();
            const summary = player.summary || {};
            const competitivePc = summary.competitive && summary.competitive.pc ? summary.competitive.pc : null;

            let competitiveRanks = '';
            if (competitivePc) {
                competitiveRanks = Object.entries(competitivePc)
                    .filter(entry => entry[1] !== null)
                    .map(entry => {
                        const role = entry[0];
                        const rank = entry[1];
                        return (
                            '<div class="card">' +
                                '<h4 class="font-bold">' + role.charAt(0).toUpperCase() + role.slice(1) + '</h4>' +
                                '<p>' + rank.division + ' ' + rank.tier + '</p>' +
                                '<img src="' + rank.rank_icon + '" alt="' + role + ' rank" class="w-8 h-8">' +
                            '</div>'
                        );
                    }).join('');
            }

            resultDiv.innerHTML =
                '<div class="card">' +
                    '<h3 class="text-xl font-bold">' + escapeHtml(summary.username || 'Unknown Player') + '</h3>' +
                    '<img src="' + (summary.avatar || 'https://via.placeholder.com/150') + '" alt="Player avatar" class="w-32 h-32">' +
                    '<p>Title: ' + escapeHtml(summary.title || 'N/A') + '</p>' +
                    '<p>Endorsement Level: ' + escapeHtml(summary.endorsement ? summary.endorsement.level : 'N/A') + '</p>' +
                '</div>' +
                '<div class="mt-4">' +
                    '<h4 class="font-bold mb-2">Competitive Ranks (PC)</h4>' +
                    (competitiveRanks || '<div class="status">No competitive ranks available.</div>') +
                '</div>';
        } catch (error) {
            console.error('Error fetching player data:', error);
            resultDiv.innerHTML = '<div class="status">Player not found or an error occurred.</div>';
        }
    }

    function bindEvents() {
                document.querySelectorAll('.hero-card-button').forEach(button => {
                    button.addEventListener('click', () => {
                        const heroKey = button.dataset.heroKey;
                        if (heroKey) {
                            showHeroDetails(heroKey);
                        }
                    });
                });

        document.querySelectorAll('.nav-link').forEach(btn => {
            btn.addEventListener('click', () => showSection(btn.dataset.section));
        });

        const heroSearch = document.getElementById('heroSearch');
        const heroRoleFilter = document.getElementById('heroRoleFilter');
        if (heroSearch) {
            heroSearch.addEventListener('input', event => {
                state.heroSearch = event.target.value;
                applyHeroFilters();
            });
        }
        if (heroRoleFilter) {
            heroRoleFilter.addEventListener('change', event => {
                state.heroRole = event.target.value;
                applyHeroFilters();
            });
        }

        const mapSearch = document.getElementById('mapSearch');
        if (mapSearch) {
            mapSearch.addEventListener('input', event => {
                state.mapSearch = event.target.value;
                applyFilter('.map-card', state.mapSearch);
            });
        }

        const gamemodeSearch = document.getElementById('gamemodeSearch');
        if (gamemodeSearch) {
            gamemodeSearch.addEventListener('input', event => {
                state.gamemodeSearch = event.target.value;
                applyFilter('.gamemode-card', state.gamemodeSearch);
            });
        }

        const playerInput = document.getElementById('playerInput');
        if (playerInput) {
            playerInput.addEventListener('keydown', event => {
                if (event.key === 'Enter') {
                    searchPlayer();
                }
            });
        }

        const playerButton = document.getElementById('playerSearchBtn');
        if (playerButton) {
            playerButton.addEventListener('click', searchPlayer);
        }

        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const nextTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                setTheme(nextTheme);
            });
        }

        const jumpToPlayers = document.getElementById('jumpToPlayers');
        if (jumpToPlayers) {
            jumpToPlayers.addEventListener('click', () => showSection('players'));
        }

        const closeModalButton = document.getElementById('closeModalBtn');
        if (closeModalButton) {
            closeModalButton.addEventListener('click', closeModal);
        }

        const modal = document.getElementById('heroModal');
        if (modal) {
            modal.addEventListener('click', event => {
                if (event.target === modal) {
                    closeModal();
                }
            });
        }

        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                closeModal();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        initTheme();
        bindEvents();
        const initialSection = window.location.hash ? window.location.hash.slice(1) : 'heroes';
        showSection(initialSection || 'heroes');
        applyHeroFilters();
    });

    window.UnderWatch = {
        showHeroDetails,
        closeModal,
        searchPlayer
    };