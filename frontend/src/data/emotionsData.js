// Datos extraídos fielmente del documento "Frasco versículos bíblicos según emociones"
// Versión Reina-Valera 1960 (RVR1960)

export const THEME_HEADER = {
  title: "Frasco de Versículos Bíblicos según Emociones",
  tagline: "LÉEME CUANDO TE SIENTAS...",
  motto: "Dios comprende cada una de tus emociones y te acompaña en todas ellas.",
  keyVerse: {
    reference: "Salmos 119:105",
    text: "Lámpara es a mis pies tu palabra, y lumbrera a mi camino."
  }
};

export const EMOTIONS_DATA = [
  {
    id: "feliz",
    name: "Feliz",
    color: "#F472B6", // Rosa pastel
    bgColor: "#FFF1F6",
    cardBg: "linear-gradient(135deg, #FFF1F6 0%, #FCE7F3 100%)",
    borderColor: "#F472B6",
    textColor: "#9D174D",
    accentColor: "#EC4899",
    description: "Lleno de gozo, regocijo y agradecimiento al Señor.",
    prayer: "Padre Celestial, te alabo con todo mi corazón por el gozo que derramas en mi vida. Que mi alegría sea testimonio de tu bondad y fortaleza para quienes me rodean.",
    verses: [
      { id: "fel-1", reference: "Salmo 118:24", text: "Este es el día que hizo Jehová; nos gozaremos y alegraremos en él." },
      { id: "fel-2", reference: "Filipenses 4:4", text: "Regocijaos en el Señor siempre. Otra vez digo: ¡Regocijaos!" },
      { id: "fel-3", reference: "Salmo 126:2", text: "Entonces nuestra boca se llenará de risa, Y nuestra lengua de alabanza; Entonces dirán entre las naciones: Grandes cosas ha hecho Jehová con estos." },
      { id: "fel-4", reference: "Salmo 16:11", text: "Me mostrarás la senda de la vida; En tu presencia hay plenitud de gozo; Delicias a tu diestra para siempre." },
      { id: "fel-5", reference: "Juan 15:11", text: "Estas cosas os he hablado, para que mi gozo esté en vosotros, y vuestro gozo sea cumplido." },
      { id: "fel-6", reference: "Proverbios 15:13", text: "El corazón alegre hermosea el rostro; Mas por el dolor del corazón el espíritu se abate." },
      { id: "fel-7", reference: "Salmo 30:11", text: "Has cambiado mi lamento en baile..." },
      { id: "fel-8", reference: "Isaías 55:12", text: "Porque con alegría saldréis, y con paz seréis vueltos..." },
      { id: "fel-9", reference: "Nehemías 8:10", text: "...no os entristezcáis, porque el gozo de Jehová es vuestra fuerza." },
      { id: "fel-10", reference: "Salmo 144:15", text: "Bienaventurado el pueblo cuyo Dios es Jehová." },
      { id: "fel-11", reference: "Salmo 37:4", text: "Deléitate asimismo en Jehová, Y él te concederá las peticiones de tu corazón." },
      { id: "fel-12", reference: "Romanos 12:12", text: "Gozosos en la esperanza; sufridos en la tribulación; constantes en la oración." },
      { id: "fel-13", reference: "Isaías 12:6", text: "Regocíjate y canta, oh moradora de Sion; porque grande es en medio de ti el Santo de Israel." },
      { id: "fel-14", reference: "Salmo 9:2", text: "Me alegraré y me regocijaré en ti; Cantaré a tu nombre, oh Altísimo." },
      { id: "fel-15", reference: "Lucas 10:20", text: "...regocijaos de que vuestros nombres están escritos en los cielos." },
      { id: "fel-16", reference: "Sofonías 3:17", text: "Jehová está en medio de ti, poderoso, Él salvará; se gozará sobre ti con alegría, callará de amor, se regocijará sobre ti con cánticos." },
      { id: "fel-17", reference: "Proverbios 17:22", text: "El corazón alegre constituye buen remedio; Mas el espíritu triste seca los huesos." },
      { id: "fel-18", reference: "1 Crónicas 16:27", text: "Alabanza y magnificencia delante de él; Poder y alegría en su morada." },
      { id: "fel-19", reference: "Salmos 32:11", text: "Alegraos en Jehová y gozaos, justos; Y cantad con júbilo todos vosotros los rectos de corazón." },
      { id: "fel-20", reference: "Salmos 126:5", text: "Los que sembraron con lágrimas, con regocijo segarán." },
      { id: "fel-21", reference: "Mateo 5:12", text: "Gozaos y alegraos, porque vuestro galardón es grande en los cielos; porque así persiguieron a los profetas que fueron antes de vosotros." },
      { id: "fel-22", reference: "Romanos 15:13", text: "Y el Dios de esperanza os llene de todo gozo y paz en el creer, para que abundéis en esperanza por el poder del Espíritu Santo." }
    ]
  },
  {
    id: "bendecido",
    name: "Bendecido",
    color: "#FBBF24", // Amarillo suave / dorado pastel
    bgColor: "#FEFCE8",
    cardBg: "linear-gradient(135deg, #FEFCE8 0%, #FEF08A 100%)",
    borderColor: "#F59E0B",
    textColor: "#92400E",
    accentColor: "#D97706",
    description: "Consciente del favor inmerecido, sustento y fidelidad divina.",
    prayer: "Señor Dios todopoderoso, gracias por cada bendición espiritual y terrenal. Reconozco que de tu mano provienen todas las cosas buenas y deseo ser de bendición a otros.",
    verses: [
      { id: "ben-1", reference: "Santiago 1:17", text: "Toda buena dádiva y todo don perfecto desciende de lo alto, del Padre de las luces, en el cual no hay mudanza, ni sombra de variación." },
      { id: "ben-2", reference: "Salmo 103:2", text: "Bendice, alma mía, a Jehová, Y no olvides ninguno de sus beneficios." },
      { id: "ben-3", reference: "Salmo 100:4", text: "Entrad por sus puertas con acción de gracias, Por sus atrios con alabanza; Alabadle, bendecid su nombre." },
      { id: "ben-4", reference: "Efesios 1:3", text: "Bendito sea el Dios y Padre de nuestro Señor Jesucristo, que nos bendijo con toda bendición espiritual en los lugares celestiales en Cristo." },
      { id: "ben-5", reference: "Salmo 67:7", text: "Bendíganos Dios, Y témanlo todos los términos de la tierra." },
      { id: "ben-6", reference: "1 Tesalonicenses 5:18", text: "Dad gracias en todo, porque esta es la voluntad de Dios para con vosotros en Cristo Jesús." },
      { id: "ben-7", reference: "Deuteronomio 28:6", text: "Bendito serás en tu entrar, y bendito en tu salir." },
      { id: "ben-8", reference: "Filipenses 4:19", text: "Mi Dios, pues, suplirá todo lo que os falta conforme a sus riquezas en gloria en Cristo Jesús." },
      { id: "ben-9", reference: "Jeremías 17:7", text: "Bendito el varón que confía en Jehová, y cuya confianza es Jehová." },
      { id: "ben-10", reference: "Salmo 23:1", text: "Jehová es mi pastor; nada me faltará." },
      { id: "ben-11", reference: "Salmo 34:8", text: "Gustad, y ved que es bueno Jehová; Dichoso el hombre que confía en él." },
      { id: "ben-12", reference: "2 Corintios 9:8", text: "Y poderoso es Dios para hacer que abunde en vosotros toda gracia, a fin de que, teniendo siempre en todas las cosas todo lo suficiente, abundéis para toda buena obra." },
      { id: "ben-13", reference: "Salmo 65:11", text: "Tú coronas el año con tus bienes, Y tus nubes destilan grosura." },
      { id: "ben-14", reference: "Proverbios 10:22", text: "La bendición de Jehová es la que enriquece." },
      { id: "ben-15", reference: "Salmo 31:19", text: "¡Cuán grande es tu bondad, que has guardado para los que te temen..." },
      { id: "ben-16", reference: "Malaquías 3:10", text: "...derramaré sobre vosotros bendición hasta que sobreabunde." },
      { id: "ben-17", reference: "Romanos 8:32", text: "El que no escatimó ni a su propio Hijo, sino que lo entregó por todos nosotros, ¿cómo no nos dará también con él todas las cosas?" },
      { id: "ben-18", reference: "Isaías 58:11", text: "Jehová te pastoreará siempre, y en las sequías saciará tu alma, y dará vigor a tus huesos; y serás como huerto de riego, y como manantial de aguas, cuyas aguas nunca faltan." },
      { id: "ben-19", reference: "Números 6:24-26", text: "Jehová te bendiga, y te guarde; Jehová haga resplandecer su rostro sobre ti, y tenga de ti misericordia; Jehová alce sobre ti su rostro, y ponga en ti paz." },
      { id: "ben-20", reference: "Deuteronomio 28:2", text: "Y vendrán sobre ti todas estas bendiciones, y te alcanzarán, si oyeres la voz de Jehová tu Dios." },
      { id: "ben-21", reference: "Salmos 115:14-15", text: "Aumentará Jehová bendición sobre vosotros; sobre vosotros y sobre vuestros hijos. Benditos vosotros de Jehová, que hizo los cielos y la tierra." },
      { id: "ben-22", reference: "Salmos 84:11", text: "Porque sol y escudo es Jehová Dios; gracia y gloria dará Jehová; no quitará el bien a los que andan en integridad." }
    ]
  },
  {
    id: "enojado",
    name: "Enojado",
    color: "#FB7185", // Salmón / Coral suave
    bgColor: "#FFF1F2",
    cardBg: "linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)",
    borderColor: "#F43F5E",
    textColor: "#9F1239",
    accentColor: "#E11D48",
    description: "Sintiendo ira, frustración u ofensa, buscando templanza y perdón.",
    prayer: "Señor Jesús, pongo mi frustración e ira en tus manos. Llena mi corazón de mansedumbre, pon un freno a mis labios y dame la gracia para perdonar y actuar con sabiduría.",
    verses: [
      { id: "eno-1", reference: "Efesios 4:26", text: "Airaos, pero no pequéis; no se ponga el sol sobre vuestro enojo." },
      { id: "eno-2", reference: "Proverbios 15:1", text: "La blanda respuesta quita la ira; Mas la palabra áspera hace subir el furor." },
      { id: "eno-3", reference: "Santiago 1:19-20", text: "Todo hombre sea pronto para oír, tardo para hablar, tardo para airarse; ...la ira del hombre no obra la justicia de Dios." },
      { id: "eno-4", reference: "Proverbios 14:29", text: "El que tarda en airarse es grande de entendimiento; Mas el que es impaciente de espíritu enaltece la necedad." },
      { id: "eno-5", reference: "Romanos 12:21", text: "No seas vencido de lo malo, sino vence con el bien el mal." },
      { id: "eno-6", reference: "Mateo 5:9", text: "Bienaventurados los pacificadores, porque ellos serán llamados hijos de Dios." },
      { id: "eno-7", reference: "Proverbios 19:11", text: "El sentido común hace que uno sea paciente; el honor es pasar por alto la ofensa." },
      { id: "eno-8", reference: "Colosenses 3:13", text: "Sean comprensivos con las faltas de los demás y perdonen." },
      { id: "eno-9", reference: "Proverbios 16:32", text: "Mejor es el que tarda en airarse que el fuerte..." },
      { id: "eno-10", reference: "Gálatas 5:22-23", text: "Mas el fruto del Espíritu es amor, gozo, paz, paciencia, benignidad, bondad, fe, mansedumbre, templanza; contra tales cosas no hay ley." },
      { id: "eno-11", reference: "Proverbios 29:11", text: "El necio da rienda suelta a toda su ira, Mas el sabio al fin la sosiega." },
      { id: "eno-12", reference: "Salmo 37:8", text: "Deja la ira, y desecha el enojo..." },
      { id: "eno-13", reference: "Proverbios 22:24-25", text: "No te entremetas con el iracundo, Ni te acompañes con el hombre de enojos, No sea que aprendas sus maneras, Y tomes lazo para tu alma." },
      { id: "eno-14", reference: "Eclesiastés 7:9", text: "No te apresures en tu espíritu a enojarte; porque el enojo reposa en el seno de los necios." },
      { id: "eno-15", reference: "Romanos 12:17", text: "No paguéis a nadie mal por mal; procurad lo bueno delante de todos los hombres." },
      { id: "eno-16", reference: "Efesios 4:31", text: "Quítense de vosotros toda amargura, enojo, ira, gritería y maledicencia, y toda malicia." },
      { id: "eno-17", reference: "Salmo 4:4", text: "Temblad, y no pequéis; Meditad en vuestro corazón estando en vuestra cama, y callad..." },
      { id: "eno-18", reference: "Colosenses 3:15", text: "Y la paz de Dios gobierne en vuestros corazones, a la que asimismo fuisteis llamados en un solo cuerpo; y sed agradecidos." },
      { id: "eno-19", reference: "Eclesiastés 10:4", text: "Si el espíritu del príncipe se exaltare contra ti, no dejes tu lugar; porque la mansedumbre hará cesar grandes ofensas." },
      { id: "eno-20", reference: "Proverbios 25:28", text: "Como ciudad derribada y sin muro es el hombre cuyo espíritu no tiene rienda." },
      { id: "eno-21", reference: "Salmos 37:7", text: "Guarda silencio ante Jehová, y espera en él; No te alteres con motivo del que prospera en su camino, Por el hombre que hace maldades." },
      { id: "eno-22", reference: "Santiago 3:17", text: "Pero la sabiduría que es de lo alto es primeramente pura, después pacífica, amable, benigna, llena de misericordia y de buenos frutos, sin incertidumbre ni hipocresía." }
    ]
  },
  {
    id: "ansioso",
    name: "Ansioso",
    color: "#34D399", // Verde menta pastel
    bgColor: "#ECFDF5",
    cardBg: "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)",
    borderColor: "#10B981",
    textColor: "#065F46",
    accentColor: "#059669",
    description: "Inquieto por el futuro, con cargas pesadas o preocupaciones.",
    prayer: "Señor de Paz, entrego en tus manos todo afán y temor. Tú tienes el control de mis días. Abrazo tu promesa de reposo y descanso bajo la sombra de tus alas.",
    verses: [
      { id: "ans-1", reference: "Filipenses 4:6-7", text: "Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias. Y la paz de Dios, que sobrepasa todo entendimiento, guardará vuestros corazones y vuestros pensamientos en Cristo Jesús." },
      { id: "ans-2", reference: "Isaías 41:10", text: "No temas, porque yo estoy contigo; no desmayes, porque yo soy tu Dios que te esfuerzo; siempre te ayudaré, siempre te sustentaré con la diestra de mi justicia." },
      { id: "ans-3", reference: "1 Pedro 5:7", text: "echando toda vuestra ansiedad sobre él, porque él tiene cuidado de vosotros." },
      { id: "ans-4", reference: "Mateo 6:34", text: "Así que, no os afanéis por el día de mañana, porque el día de mañana traerá su afán. Basta a cada día su propio mal." },
      { id: "ans-5", reference: "Juan 14:27", text: "La paz os dejo, mi paz os doy; yo no os la doy como el mundo la da. No se turbe vuestro corazón, ni tenga miedo." },
      { id: "ans-6", reference: "Josué 1:9", text: "Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo en dondequiera que vayas." },
      { id: "ans-7", reference: "Salmo 56:3", text: "En el día que temo, Yo en ti confío." },
      { id: "ans-8", reference: "Isaías 26:3", text: "Tú guardarás en completa paz a aquel cuyo pensamiento en ti persevera; porque en ti ha confiado." },
      { id: "ans-9", reference: "Salmo 94:19", text: "En la multitud de mis pensamientos dentro de mí, Tus consolaciones alegraban mi alma." },
      { id: "ans-10", reference: "Proverbios 3:24", text: "Cuando te acuestes, no tendrás temor, Sino que te acostarás, y tu sueño será grato." },
      { id: "ans-11", reference: "Salmo 121:1-2", text: "Alzaré mis ojos a los montes; ¿De dónde vendrá mi socorro? Mi socorro viene de Jehová, Que hizo los cielos y la tierra." },
      { id: "ans-12", reference: "Isaías 35:4", text: "Decid a los de corazón apocado: Esforzaos, no temáis; he aquí que vuestro Dios viene con retribución, con pago; Dios mismo vendrá, y os salvará." },
      { id: "ans-13", reference: "Jeremías 29:11", text: "Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal, para daros el fin que esperáis." },
      { id: "ans-14", reference: "Salmo 27:1", text: "Jehová es mi luz y mi salvación; ¿de quién temeré? Jehová es la fortaleza de mi vida; ¿de quién he de atemorizarme?" },
      { id: "ans-15", reference: "Salmo 46:1", text: "Dios es nuestro amparo y fortaleza, Nuestro pronto auxilio en las tribulaciones." },
      { id: "ans-16", reference: "Mateo 11:28", text: "Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar." },
      { id: "ans-17", reference: "Romanos 8:31", text: "...Si Dios es por nosotros, ¿quién contra nosotros?" },
      { id: "ans-18", reference: "Isaías 40:31", text: "pero los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas; correrán, y no se cansarán; caminarán, y no se fatigarán." },
      { id: "ans-19", reference: "Salmo 55:22", text: "Echa sobre Jehová tu carga, y él te sustentará; No dejará para siempre caído al justo." },
      { id: "ans-20", reference: "2 Corintios 12:9", text: "Y me ha dicho: Bástate mi gracia; porque mi poder se perfecciona en la debilidad. Por tanto, de buena gana me gloriaré más bien en mis debilidades, para que repose sobre mí el poder de Cristo." },
      { id: "ans-21", reference: "Nahúm 1:7", text: "Jehová es bueno, fortaleza en el día de la angustia; y conoce a los que en él confían." },
      { id: "ans-22", reference: "Juan 16:33", text: "...En el mundo tendréis aflicción; pero confiad, yo he vencido al mundo." }
    ]
  },
  {
    id: "solitario",
    name: "Solitario",
    color: "#60A5FA", // Celeste cielo pastel
    bgColor: "#EFF6FF",
    cardBg: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
    borderColor: "#3B82F6",
    textColor: "#1E40AF",
    accentColor: "#2563EB",
    description: "Sintiendo desamparo o falta de apoyo humano, recordando que Dios está cerca.",
    prayer: "Amado Dios, aunque me sienta solo(a), tu Palabra me asegura que jamás me desampararás. Siento tu presencia viva que me envuelve con amor incondicional.",
    verses: [
      { id: "sol-1", reference: "Salmo 34:18", text: "Cercano está Jehová a los quebrantados de corazón; Y salva a los contritos de espíritu." },
      { id: "sol-2", reference: "Isaías 41:13", text: "Porque yo Jehová soy tu Dios, quien te sostiene de tu mano derecha, y te dice: No temas, yo te ayudo." },
      { id: "sol-3", reference: "Deuteronomio 31:6", text: "Esforzaos y cobrad ánimo; no temáis, ni tengáis miedo de ellos, porque Jehová tu Dios es el que va contigo; no te dejará, ni te desamparará." },
      { id: "sol-4", reference: "Mateo 28:20", text: "...y he aquí yo estoy con vosotros todos los días, hasta el fin del mundo. Amén." },
      { id: "sol-5", reference: "Salmo 23:4", text: "Aunque ande en valle de sombra de muerte, No temeré mal alguno, porque tú estarás conmigo; Tu vara y tu cayado me infundirán aliento." },
      { id: "sol-6", reference: "Hebreos 13:5", text: "Sean vuestras costumbres sin avaricia, contentos con lo que tenéis ahora; porque él dijo: No te desampararé, ni te dejaré." },
      { id: "sol-7", reference: "Salmo 139:8", text: "...Si subiere a los cielos, allí estás tú; Y si en el Seol hiciere mi estrado, he aquí, allí tú estás." },
      { id: "sol-8", reference: "Isaías 43:2", text: "Cuando pases por las aguas, yo estaré contigo; y si por los ríos, no te anegarán. Cuando pases por el fuego, no te quemarás, ni la llama arderá en ti." },
      { id: "sol-9", reference: "Deuteronomio 31:6", text: "Esforzaos y cobrad ánimo; no temáis, ni tengáis miedo de ellos, porque Jehová tu Dios es el que va contigo; no te dejará, ni te desamparará." },
      { id: "sol-10", reference: "Salmos 139:7", text: "¿A dónde podría alejarme de tu Espíritu? ¿A dónde podría huir de tu presencia?" },
      { id: "sol-11", reference: "2 Corintios 1:3-4", text: "Bendito sea el Dios y Padre de nuestro Señor Jesucristo... el cual nos consuela en todas nuestras tribulaciones, para que podamos también nosotros consolar a los que están en cualquier tribulación..." },
      { id: "sol-12", reference: "Isaías 49:15-16", text: "¿Se olvidará la mujer de lo que dio a luz, para dejar de compadecerse del hijo de su vientre? Aunque olvide ella, yo nunca me olvidaré de ti..." },
      { id: "sol-13", reference: "2 Timoteo 4:17", text: "Pero el Señor estuvo a mi lado, y me dio fuerzas, para que por mí fuese cumplida la predicación, y que todos los gentiles oyesen..." },
      { id: "sol-14", reference: "Salmo 62:1-2", text: "En Dios solamente está acallada mi alma; De él viene mi salvación. Él solamente es mi roca y mi salvación; Es mi refugio, no resbalaré mucho." },
      { id: "sol-15", reference: "Isaías 30:18", text: "Jehová esperará para tener piedad de vosotros, y por tanto, será exaltado teniendo de vosotros misericordia; porque Jehová es Dios justo; bienaventurados todos los que confían en él." },
      { id: "sol-16", reference: "Salmo 31:7", text: "Me gozaré y alegraré en tu misericordia, Porque has visto mi aflicción; Has conocido mi alma en las angustias." },
      { id: "sol-17", reference: "Isaías 54:7-8", text: "Por un poco de tiempo te dejé, pero te recogeré con grandes misericordias. En un poco de ira escondí mi rostro de ti, por un momento; pero con misericordia eterna tendré compasión de ti, dijo Jehová tu Redentor." },
      { id: "sol-18", reference: "Salmo 27:10", text: "Aunque mi padre y mi madre me dejaran, Con todo, Jehová me recogerá." },
      { id: "sol-19", reference: "Josué 1:5", text: "Nadie te podrá hacer frente en todos los días de tu vida; como estuve con Moisés, estaré contigo; no te dejaré, ni te desamparará." },
      { id: "sol-20", reference: "Romanos 8:38-39", text: "Por lo cual estoy seguro de que ni la muerte, ni la vida, ni ángeles, ni principados, ni potestades, ni lo presente, ni lo por venir, ni lo alto, ni lo profundo, ni ninguna otra cosa creada nos podrá separar del amor de Dios, que es en Cristo Jesús Señor nuestro." },
      { id: "sol-21", reference: "Sofonías 3:17", text: "Jehová está en medio de ti, poderoso, él salvará; se gozará sobre ti con alegría, callará de amor, se regocijará sobre ti con cánticos." },
      { id: "sol-22", reference: "1 Pedro 2:9", text: "Mas vosotros sois linaje escogido, real sacerdocio, nación santa, pueblo adquirido por Dios, para que anunciéis las virtudes de aquel que os llamó de las tinieblas a su luz admirable." }
    ]
  },
  {
    id: "triste",
    name: "Triste",
    color: "#A78BFA", // Lila / Violeta pastel
    bgColor: "#F5F3FF",
    cardBg: "linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)",
    borderColor: "#8B5CF6",
    textColor: "#5B21B6",
    accentColor: "#7C3AED",
    description: "Con aflicción en el alma o lágrimas, necesitando bálsamo y sanidad divina.",
    prayer: "Señor de Misericordia, tú cuentas cada una de mis lágrimas y sanas mi corazón herido. Transforma mi llanto en esperanza y renueva mi espíritu con tu gozo.",
    verses: [
      { id: "tri-1", reference: "Mateo 5:4", text: "Bienaventurados los que lloran, porque ellos recibirán consolación." },
      { id: "tri-2", reference: "Salmo 147:3", text: "Él sana a los quebrantados de corazón, Y venda sus heridas." },
      { id: "tri-3", reference: "2 Corintios 1:3-4", text: "Nos consuela en todas nuestras tribulaciones, para que podamos también nosotros consolar a los que están en cualquier tribulación, por medio de la consolación con que nosotros somos consolados por Dios." },
      { id: "tri-4", reference: "Juan 16:33", text: "Estas cosas os he hablado para que en mí tengáis paz. En el mundo tendréis aflicción; pero confiad, yo he vencido al mundo." },
      { id: "tri-5", reference: "Salmo 42:11", text: "¿Por qué te abates, oh alma mía, Y por qué te turbas dentro de mí? Espera en Dios; porque aún he de alabarle, Salvación mía y Dios mío." },
      { id: "tri-6", reference: "Apocalipsis 21:4", text: "Enjugará Dios toda lágrima de los ojos..." },
      { id: "tri-7", reference: "Salmo 30:5", text: "Porque un momento será su ira, Pero su favor dura toda la vida. Por la noche durará el lloro, Y a la mañana vendrá la alegría." },
      { id: "tri-8", reference: "Isaías 40:29", text: "Él da esfuerzo al cansado, y multiplica las fuerzas al que no tiene ninguna." },
      { id: "tri-9", reference: "Salmo 55:22", text: "Echa sobre Jehová tu carga, y él te sustentará; No dejará para siempre caído al justo." },
      { id: "tri-10", reference: "Lamentaciones 3:22-23", text: "Por la misericordia de Jehová no hemos sido consumidos, porque nunca decayeron sus misericordias. Nuevas son cada mañana; grande es tu fidelidad." },
      { id: "tri-11", reference: "Salmo 147:6", text: "Jehová exalta a los humildes, Y humilla a los impíos hasta la tierra." },
      { id: "tri-12", reference: "Salmo 40:1", text: "Pacientemente esperé a Jehová, Y se inclinó a mí, y oyó mi clamor." },
      { id: "tri-13", reference: "Isaías 61:1", text: "El Espíritu de Jehová el Señor está sobre mí, porque me ungió Jehová; me ha enviado a predicar buenas nuevas a los abatidos, a vendar a los quebrantados de corazón..." },
      { id: "tri-14", reference: "2 Corintios 4:8-9", text: "... estamos atribulados en todo, mas no angustiados; en apuros, mas no desesperados; perseguidos, mas no desamparados; derribados, pero no destruidos." },
      { id: "tri-15", reference: "Romanos 15:13", text: "Y el Dios de esperanza os llene de todo gozo y paz en el creer, para que abundéis en esperanza por el poder del Espíritu Santo." },
      { id: "tri-16", reference: "Jeremías 31:13", text: "...y cambiaré su lloro en gozo, y los consolaré, y los alegraré de su dolor." },
      { id: "tri-17", reference: "Salmos 42:5", text: "¿Por qué te abates, oh alma mía, Y por qué te turbas dentro de mí? Espera en Dios; porque aún he de alabarle, Salvación mía y Dios mío." },
      { id: "tri-18", reference: "Isaías 43:2", text: "Cuando pases por las aguas, yo estaré contigo; y si por los ríos, no te anegarán. Cuando pases por el fuego, no te quemarás, ni la llama arderá en ti." },
      { id: "tri-19", reference: "Salmo 34:17-18", text: "Claman los justos, y Jehová oye, y los libra de todas sus angustias. Cercano está Jehová a los quebrantados de corazón; y salva a los contritos de espíritu." },
      { id: "tri-20", reference: "Nahúm 1:7", text: "Jehová es bueno, fortaleza en el día de la angustia; y conoce a los que en él confían." },
      { id: "tri-21", reference: "Mateo 11:29", text: "Llevad mi yugo sobre vosotros, y aprended de mí, que soy manso y humilde de corazón; y hallaréis descanso para vuestras almas." },
      { id: "tri-22", reference: "Mateo 11:28", text: "Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar" }
    ]
  }
];

// Utilidad para obtener versículo aleatorio por emoción
export function getRandomVerseByEmotion(emotionId) {
  const emotion = EMOTIONS_DATA.find((e) => e.id.toLowerCase() === emotionId.toLowerCase());
  if (!emotion || !emotion.verses.length) return null;
  const randomIndex = Math.floor(Math.random() * emotion.verses.length);
  return {
    ...emotion.verses[randomIndex],
    emotionId: emotion.id,
    emotionName: emotion.name,
    color: emotion.color,
    bgColor: emotion.bgColor,
    borderColor: emotion.borderColor,
    textColor: emotion.textColor,
    accentColor: emotion.accentColor,
    prayer: emotion.prayer
  };
}

// Utilidad para sacar un versículo aleatorio de todo el frasco
export function getRandomVerseFromJar() {
  const randomEmotionIndex = Math.floor(Math.random() * EMOTIONS_DATA.length);
  const emotion = EMOTIONS_DATA[randomEmotionIndex];
  const randomVerseIndex = Math.floor(Math.random() * emotion.verses.length);
  return {
    ...emotion.verses[randomVerseIndex],
    emotionId: emotion.id,
    emotionName: emotion.name,
    color: emotion.color,
    bgColor: emotion.bgColor,
    borderColor: emotion.borderColor,
    textColor: emotion.textColor,
    accentColor: emotion.accentColor,
    prayer: emotion.prayer
  };
}
