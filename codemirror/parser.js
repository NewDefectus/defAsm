// This file was generated by lezer-generator. You probably shouldn't edit it.
import {Parser} from "lezer"
import {tokenizer, ctxTracker} from "./asmPlugin"
export const parser = Parser.deserialize({
  version: 13,
  states: "9[OQOROOOuORO'#CiOOOP'#Cu'#CuO}ORO'#CjO#QORO'#CjO#XORO'#CjO$eORO'#CjO$oORO'#CjO%[ORO'#CrOOOP'#DR'#DRO%oORO'#DRQ%}OROOOOOP,59T,59TO$yORO,59`OOOP-E6s-E6sO&VORO,59UO#XORO,59UO&oORO,59UO&yORO,59UO$yORO'#CkO'TORO'#DTOOOP,59U,59UO!lORO,59UOOOP'#Cv'#CvO'lORO'#CnO'}OTO'#CnO(oOTO'#CpO)ZORO'#CoO)oOQO'#CoO)tORO'#D`O$yORO'#D`O*qORO'#D`O*{ORO'#CvO+dORO'#ClO,WOTO'#ClO,eOQO'#CqO,{ORO,59UO-SORO'#ClO-eOTO'#ClO-uORO'#DeOOOP,59^,59^OOOP,59m,59mOQORO'#C|Q%}OROOOOOP1G.z1G.zOOOP1G.p1G.pO!lORO1G.pO.WORO1G.pOOOP,59V,59VO._OPO'#CmO.dORO'#CxO.{ORO,59oO/^ORO,59oO/hORO,59oOOOP-E6t-E6tO/oOTO,59YO0aOTO,59[OOOP'#Cw'#CwO/oOTO,59YO0{ORO,59YO0aOTO,59[O1^ORO,59[O1oORO'#DbO2TOSO'#DbO2`OQO,59ZO)ZORO,59ZO2eORO'#CyO3RORO,59zO3dORO,59zO3nORO,59zO3uORO,59zO$yORO,59zOOOP,59],59]O4POQO,59]O4XOTO,59WO4XOTO,59WO4sORO,59WO5UORO,59]O5^ORO'#CpO(oOTO'#CpO5oORO1G.pO6QOTO,59WO6QOTO,59WO$yORO,59WO6oORO'#C{O7VORO,5:POOOP,59h,59hOOOP-E6z-E6zOOOP7+$[7+$[O7hORO7+$[O7yOQO,59XO8OORO,59dOOOP-E6v-E6vO8gORO1G/ZO8gORO1G/ZO8xORO1G/ZO9POTO1G.tO0{ORO1G.tO9qOTO1G.vO1^ORO1G.vOOOP-E6u-E6uOOOP1G.t1G.tOOOP1G.v1G.vO:]OSO,59|O:]OSO,59|O)ZORO,59|OOOP1G.u1G.uO:hOQO1G.uO:mORO,59eO$yORO,59eO;UORO,59eOOOP-E6w-E6wO;`ORO1G/fO;`ORO1G/fO;qORO1G/fO;xORO1G/fO<SORO1G/fO<^ORO'#CzO<lOQO1G.wOOOP1G.w1G.wO=VOTO1G.rO4sORO1G.rOOOP1G.r1G.rO<lOQO1G.wO0aOTO,59[O0aOTO,59[O=dOTO1G.rO$yORO1G.rOOOP,59g,59gOOOP-E6y-E6yOOOP1G.s1G.sO>YORO1G/OO=tORO1G/OO>aORO7+$uO>aORO7+$uO0{ORO7+$`OOOP7+$`7+$`OOOP7+$b7+$bO1^ORO7+$bO>rOSO1G/hO)ZORO1G/hOOOO1G/h1G/hOOOP7+$a7+$aO?cORO1G/PO>}ORO1G/PO?jORO1G/PO$yORO1G/PO@RORO7+%QO@RORO7+%QO@dORO7+%QO@kORO7+%QOOOO,59f,59fOOOO-E6x-E6xOOOP7+$c7+$cO4sORO7+$^OOOP7+$^7+$^O@uOQO7+$cO9qOTO1G.vO$yORO7+$^OOOP7+$j7+$jO@}ORO7+$jOAcORO<<HaOOOP<<Gz<<GzOOOP<<G|<<G|O)ZORO7+%SOOOO7+%S7+%SOOOP7+$k7+$kOAtORO7+$kOBYORO7+$kOBaORO7+$kOBxORO<<HlOBxORO<<HlOCZORO<<HlOOOP<<Gx<<GxOOOP<<G}<<G}OOOP<<HU<<HUOOOO<<Hn<<HnOOOP<<HV<<HVOCbORO<<HVOCvORO<<HVOC}OROAN>WOC}OROAN>WOOOPAN=qAN=qOD`OROAN=qODtOROG23rOOOPG23]G23]",
  stateData: "EV~OQWOSSOTTOUUOVVOWQOrPOR^Pq^Pt^P!Y^P~Os]Ov[O~OS_OT`OUaOVbOWQOR^Xq^Xt^X!Y^X~OPdOxcORwPqwPtwP!YwP~OZfO~P!lOPmOXoOYnOrjOygOzgO{iO|iO!TkOR!SPq!SPt!SP!Y!SP~OPeOrrOygO{rO|rO~OzpO!WtO~P$SOzgO!TkO~P$SOrvOygOzgO{vO|vO~OgwOR!XPq!XPt!XP!Y!XP~P$yORyOquXtuX!YuX~OtzO!YzO~OZ!OO~P!lOP}OrrOygO{rO|rO~OzpO!W!PO~P&^OzgO!TkO~P&^OZ!UO!P!RO!R!SORwXqwXtwX!YwX~Or!YOygOzgO{!XO|!XO~O}!ZO!O!]ORbXZbXqbXtbX!PbX!RbX!TdX!YbX~O}!ZO!O!_O!TdXRdXqdXtdXzdX!YdX~OP!aOr!aOygOzgO{!aO|!aO~O!T!cO~OZ!fO!P!RO!R!dOR!SXq!SXt!SX!Y!SX~OrjOygOzgO{iO|iO!TkO~OP!hOY!iO~P*]OP!kO}!jOrjXyjXzjX{jX|jX~Or!lOygOzgO{!lO|!lO~O}!ZOR`Xq`Xt`X!Y`X~O!O!nOzdX!TdX~P+uOz!oO~OrjOygOzpO{!qO|!qO~OP}O~P,jOr!sOygOzgO{!sO|!sO~O!O!uO!R`XZ`X!P`X~P+uO!R!vOR!XXq!XXt!XX!Y!XX~OP!zO~P,jOP!|O~OP!}OxcORlXqlXtlX!RlX!YlX~O!R!SORwaqwatwa!Ywa~OZ#QO!P!RO~P.{OZ#QO~P.{O}!ZO!O#TORbaZbaqbatba!Pba!Rba!Tda!Yba~O}!ZO!O#VO!TdaRdaqdatdazda!Yda~OrjOygOzgO{iO|iO~OrjOygOzgO{!qO|!qO~OP#ZOr#ZOygOzgO{#ZO|#ZO~O}!ZO!O#]O!V!UX~O!V#^O~OP#`OX#bOY#aORmXqmXtmX!RmX!YmX~P*]O!R!dOR!Saq!Sat!Sa!Y!Sa~OZ#eO!P!RO~P3ROZ#eO~P3ROZ#gO!P!RO~P3RO}#kO!R#iO~O}!ZO!O#mOR`aq`at`azda!Y`a!Tda~OrrOygOzgO{rO|rO~OP#oO}#kO~Or!YOygOzgO{#pO|#pO~Oz!oOR^iq^it^i!Y^i~O}!ZO!O#sOR`aq`at`a!R`a!Y`aZ`a!P`a~Og#tORoXqoXtoX!RoX!YoX~P$yO!R!vOR!Xaq!Xat!Xa!Y!Xa~Oz!oOR^qq^qt^q!Y^q~O!Q#vO~OZ#wO!P!RORlaqlatla!Rla!Yla~O!R!SORwiqwitwi!Ywi~OZ#zO~P8gO}!ZO!O#{ORbiZbiqbitbi!Pbi!Rbi!Tdi!Ybi~O}!ZO!O$OO!TdiRdiqditdizdi!Ydi~O}!ZO!O$QO!V!Ua~O!V$SO~OZ$TO!P!RORmaqmatma!Rma!Yma~OP$VOY$WO~P*]O!R!dOR!Siq!Sit!Si!Y!Si~OZ$YO~P;`OZ$YO!P!RO~P;`OZ$[O!P!RO~P;`OP$]O{$]O}nX!RnX~O}$_O!R#iO~O}!ZOR`iq`it`i!Y`i~O!O$`Ozdi!Tdi~P<tO!O$dO!R`iZ`i!P`i~P<tOZ$eORliqlitli!Rli!Yli~O!P!RO~P=tO!R!SORwqqwqtwq!Ywq~O}!ZO!O$jO!V!Ui~OZ$lORmiqmitmi!Rmi!Ymi~O!P!RO~P>}OZ$nO!P!RORmiqmitmi!Rmi!Ymi~O!R!dOR!Sqq!Sqt!Sq!Y!Sq~OZ$qO~P@ROZ$qO!P!RO~P@RO}$tO!R#iO~OZ$uORlqqlqtlq!Rlq!Ylq~O!R!SORwyqwytwy!Ywy~OZ$wORmqqmqtmq!Rmq!Ymq~O!P!RO~PAtOZ$yO!P!RORmqqmqtmq!Rmq!Ymq~O!R!dOR!Syq!Syt!Sy!Y!Sy~OZ${O~PBxOZ$|ORmyqmytmy!Rmy!Ymy~O!P!RO~PCbO!R!dOR!S!Rq!S!Rt!S!R!Y!S!R~OZ%PORm!Rqm!Rtm!R!Rm!R!Ym!R~O!R!dOR!S!Zq!S!Zt!S!Z!Y!S!Z~O",
  goto: "+X!YPPPPPPPPPPPPP!Z!_!c!l#j$d$z%_&R!_P!_&]&d'k(o)T)w*R*XPPPP*_P*ePPPPPPPPPP*oP*uPP+UTXOzTYOzWdS_f!OR!}!SSeUVQwWQ|]S}abQ!QcQ!hnQ#h!iS#n!n!uQ#t!vQ$V#aS$a#m#sQ$o$WT$s$`$dQ!VdQ!gmQ#R!US#f!f!hQ#x!}Q$U#`S$Z#g#hQ$f#wS$m$T$VQ$r$[S$x$n$oR$}$ySmT`Q!hoQ#X!]Q#`!dQ#|#TQ$V#bR$h#{QeVSmT`Q}bQ!hoQ#`!dR$V#b^lTV`bo!d#bSsUaQ!rtQ!{!PU#Y!]!_!nU#}#T#V#mV$i#{$O$`QeUS}atR!z!PSROzR^R`hT`o!]!d#T#b#{^qUVab!n#m$`fuW]cn!i!u!v#a#s$W$dY!Whqu!`!pY!`k!c#]$Q$jZ!pt!P!_#V$OQ![iQ!^jQ!mrQ!tvQ#S!XQ#U!Yh#W![!^!m!t#S#U#[#l#q#r$P$cQ#[!aQ#l!lQ#q!qQ#r!sQ$P#ZR$c#pQ!TdW#O!T#P#y$gS#P!U!VS#y#Q#RR$g#zQ!em[#c!e#d$X$p$z%OU#d!f!g!hW$X#e#f#g#hU$p$Y$Z$[S$z$q$rR%O${Q#j!kS$^#j$bR$b#oQ!wwR#u!wQ{ZR!y{QZOR!xzQeSS}_fR!z!OQeTR}`Q!bkQ#_!cQ$R#]Q$k$QR$v$jRxW",
  nodeNames: "⚠ Register Directive Comment Opcode IOpcode RelOpcode IRelOpcode Prefix Ptr Offset VEXRound Program LabelDefinition InstructionStatement Immediate Expression VEXMask IImmediate IMemory Relative Memory DirectiveStatement FullString SymbolDefinition",
  maxTerm: 56,
  context: ctxTracker,
  skippedNodes: [0],
  repeatNodeCount: 8,
  tokenData: ")g~RlYZ!yqr#Ors#_tu$Ruv#Yvw$Wwx$`xy%Syz%Xz{%^{|%e|}%l}!O%e!O!P%q!P!Q#Y!Q!R&_!R![%q![!](O!^!_(T!_!`(c!`!a(i!}#O(t#P#Q(y#Q#R#Y#o#p)O#p#q)T#q#r)]#r#s)b~#OO!Y~R#VP!OQyP!_!`#YQ#_O!OQ~#dUg~OY#_Zr#_rs#vs#O#_#O#P#{#P~#_~#{Og~~$OPO~#_~$WOx~Q$]P!OQvw#Y~$eU|~OY$`Zw$`wx$wx#O$`#O#P$|#P~$`~$|O|~~%PPO~$`~%XOz~~%^O}~R%eO!WP!OQR%lO!OQyP~%qO!R~~%vR{~!O!P%q!Q![%q#X#Y&P~&SP!Q![&V~&[P{~!Q![&V~&dU{~!O!P%q!Q![%q#U#V&v#X#Y&P#c#d'U#l#m'd~&yP!Q!S&|~'RP{~!Q!S&|~'XP!Q!Y'[~'aP{~!Q!Y'[~'gR!Q!['p!c!i'p#T#Z'p~'uR{~!Q!['p!c!i'p#T#Z'p~(TOv~Q(YR!OQ!^!_#Y!_!`#Y!`!a#YQ(fP!_!`#YQ(nQ!OQ!_!`#Y!`!a#Y~(yO!T~~)OO!V~~)TO!P~Q)YP!OQ#p#q#Y~)bO!Q~P)gOyP",
  tokenizers: [tokenizer, 0, 1],
  topRules: {"Program":[0,12]},
  dynamicPrecedences: {"18":1},
  tokenPrec: 0
})
