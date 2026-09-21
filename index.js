
require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
  ChannelType,
} = require("discord.js");

const discordTranscripts = require("discord-html-transcripts");

// =====================================================
// CLIENTE
// =====================================================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// =====================================================
// CONFIGURACIÓN
// =====================================================

const PREFIX = "!truco";
const CLOSE_COMMAND = "!close";

const CANAL_FILA_ID = "1491738368927596574";
const CANAL_INTERMEDIARIOS_ID = "1506448806697238682";

const CREAR_FILA_ROLE_ID = "1486959938038136912";
const STAFF_ROLE_ID = "1476541425263968391";
const EXTRA_MOD_ROLE_ID = "1211760228673257524";

const INTERMEDIARIO_ROLE_ID = "1476541425263968391";
const LOG_CHANNEL_ID = "1486176116413825206";

const URL_THUMBNAIL_PERSONALIZADO =
  "https://i.imgur.com/b7XMeUs.png";

// =====================================================
// MAPAS
// =====================================================

const estadosFilas = new Map();
const filasIntermediarios = new Map();

// =====================================================
// EMOJIS
// =====================================================

const EMOJI_CARTAS_MESA =
  "<:white_cartas_worclay:1491745807794438195>";

const EMOJI_DINERO_ANIMADO =
  "<a:money_sign:1491745833190690847>";

const EMOJI_CARTAS = "🃏";
const EMOJI_FUEGO = "🔥";
const EMOJI_MATE = "🧉";

// =====================================================
// INTERMEDIARIOS
// =====================================================

const METODOS_INTERMEDIARIOS = {
  "1548764206592032871": {
    banco: "Mercado Pago",
    nombre: "lautaro jose nehuen figueroa",
    alias: "vg.lauty7",
    link: "https://onetouch.astropay.com/payment?external_reference_id=n0iFPqlqR711ohBNW4hEEGbzRkxsTbwo",
  },

  "1049772413161836585": {
    banco: "AstroPay",
    nombre: "Candela Yazmin Bustamante",
    alias: "cxn.apos",
  },

  "1270282979037679659": {
    banco: "Naranja X",
    nombre: "Hernan Guevara",
    alias: "7hernann",
  },

  "1293263654250217549": {
    banco: "Uala",
    nombre: "Lucca demian Nuñez",
    alias: "vg.luk7",
  },

  "636714624552534016": {
    banco: "Uala",
    nombre: "Anabela Magali Martin",
    alias: "mailen.uala26",
  },

  "779427469009879040": {
    banco: "AstroPay",
    nombre: "Angela Malena Canete",
    alias: "vgkuchito",
  },

  "1291407413584592896": {
    banco: "Uala",
    nombre: "Antonella Sheila Porpora",
    alias: "vg.pepou",
  },
};

// =====================================================
// PERMISOS
// =====================================================

function puedeCrearFila(member) {
  return (
    member.permissions.has(
      PermissionsBitField.Flags.Administrator
    ) ||
    member.roles.cache.has(CREAR_FILA_ROLE_ID)
  );
}

function tienePermisoStaff(member) {
  return (
    member.permissions.has(
      PermissionsBitField.Flags.Administrator
    ) ||
    member.roles.cache.has(STAFF_ROLE_ID) ||
    member.roles.cache.has(EXTRA_MOD_ROLE_ID)
  );
}

// =====================================================
// EMBED DE PAGOS
// =====================================================

function embedPagos() {
  return new EmbedBuilder()
    .setColor(0x006400)
    .setTitle(`${EMOJI_CARTAS} REGLAS DEL TRUCO`)
    .setDescription(
      `━━━━━━━━━━━━━━━━━━

📝 **REGLAMENTO DE APUESTAS**

🌐 **Única página válida para jugar:**
┗ https://trucogame.com/game

📸 **Validación de victoria:**
┗ El ganador debe enviar captura de la victoria obligatoriamente.

💰 **Comisión:**
┗ $400 ARS en apuestas de $3.000 en adelante.

━━━━━━━━━━━━━━━━━━

**VAGANCIA SYSTEM**

⚔️ Sistema automático de apuestas

🛡️ **VAGANCIA • Sistema oficial**`
    )
    .setFooter({
      text: "TRUCO GAMING • ¡Quiero vale cuatro!",
      iconURL: URL_THUMBNAIL_PERSONALIZADO,
    });
}

// =====================================================
// EMBED DE LA FILA
// =====================================================

function crearEmbedFila(
  data = {
    f1: null,
    f2: null,
    f3: null,
  }
) {
  const p1 = data.f1
    ? `<@${data.f1}>`
    : "*Esperando retador...*";

  const p2 = data.f2
    ? `<@${data.f2}>`
    : "*Esperando retador...*";

  const p3 = data.f3
    ? `<@${data.f3}>`
    : "*Esperando retador...*";

  return new EmbedBuilder()
    .setColor(0xFFA500)
    .setTitle(`${EMOJI_MATE} | ¿QUIÉN SE PRENDE A UN TRUCO?`)
    .setDescription(
      `**Modalidad:** Apostado ${EMOJI_DINERO_ANIMADO}

**Puntos:** A 15 o 30 tantos

**Mesas disponibles:**

${EMOJI_CARTAS_MESA} **Mesa 1:** ${p1}

${EMOJI_CARTAS_MESA} **Mesa 2:** ${p2}

${EMOJI_CARTAS_MESA} **Mesa 3:** ${p3}

*Hacé clic en el botón para sentarte en la mesa.*`
    )
    .setThumbnail(URL_THUMBNAIL_PERSONALIZADO)
    .setFooter({
      text: "TRUCO GAMING • El sistema de los timberos",
    });
}

// =====================================================
// BOTONES DE FILA
// =====================================================

function botonesTripleFila() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("btn_f1")
      .setLabel("Mesa 1")
      .setEmoji("🎴")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId("btn_f2")
      .setLabel("Mesa 2")
      .setEmoji("🎴")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId("btn_f3")
      .setLabel("Mesa 3")
      .setEmoji("🎴")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId("salir_fila")
      .setLabel("Levantarse")
      .setEmoji("🚫")
      .setStyle(ButtonStyle.Danger)
  );
}

// =====================================================
// AVISO DE INTERMEDIARIOS
// =====================================================

function crearAvisoIntermediario(jugadores) {
  return new EmbedBuilder()
    .setColor(0x00AE86)
    .setTitle("🃏 NUEVA FILA DE TRUCO")
    .setDescription(
      `🔥 **¡HAY UNA PARTIDA DISPONIBLE!**

👤 **Jugadores:**

<@${jugadores[0]}>
<@${jugadores[1]}>

💰 **Modalidad:** Truco apostado

🤝 Un intermediario puede tomar esta fila.

⚠️ El primer intermediario que tome la fila será asignado.`
    )
    .setFooter({
      text: "VAGANCIA SYSTEM • INTERMEDIARIOS",
    });
}

async function avisarIntermediarios(
  interaction,
  jugadores,
  canal
) {
  try {
    const canalIntermediarios =
      await interaction.guild.channels.fetch(
        CANAL_INTERMEDIARIOS_ID
      );

    if (!canalIntermediarios?.isTextBased()) {
      throw new Error(
        "El canal de intermediarios no existe o no es de texto."
      );
    }

    const mensaje = await canalIntermediarios.send({
      content:
        `🔔 **NUEVA PARTIDA DISPONIBLE**\n\n` +
        `<@&${INTERMEDIARIO_ROLE_ID}>`,

      embeds: [
        crearAvisoIntermediario(jugadores),
      ],

      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(
              `tomar_fila_${canal.id}`
            )
            .setLabel("TOMAR FILA")
            .setEmoji("🤝")
            .setStyle(ButtonStyle.Success)
        ),
      ],

      allowedMentions: {
        roles: [INTERMEDIARIO_ROLE_ID],
      },
    });

    filasIntermediarios.set(canal.id, {
      jugadores,
      canalId: canal.id,
      mensajeId: mensaje.id,
      intermediarioId: null,
    });

    console.log(
      `✅ Aviso de intermediario enviado: ${canal.id}`
    );

  } catch (error) {
    console.error(
      "❌ ERROR AL ENVIAR AVISO DE INTERMEDIARIO:",
      error
    );
  }
}

// =====================================================
// DATOS DE PAGO
// =====================================================

function crearDatosPago(intermediario) {
  return `🏦 **Método:** ${intermediario.banco}
👤 **Titular:** ${intermediario.nombre}
🔗 **Alias:** \`${intermediario.alias}\`
${
  intermediario.link
    ? `🌐 **Link:** ${intermediario.link}`
    : ""
}`;
}

// =====================================================
// BORRAR AVISO DE INTERMEDIARIO
// =====================================================

async function borrarAvisoIntermediario(
  guild,
  canalId
) {
  const fila =
    filasIntermediarios.get(canalId);

  if (!fila) return;

  try {
    const canalIntermediarios =
      await guild.channels.fetch(
        CANAL_INTERMEDIARIOS_ID
      );

    if (canalIntermediarios?.isTextBased()) {
      const aviso =
        await canalIntermediarios.messages.fetch(
          fila.mensajeId
        ).catch(() => null);

      if (aviso) {
        await aviso.delete().catch(() => {});
      }
    }
  } catch (error) {
    console.error(
      "❌ Error al borrar aviso:",
      error
    );
  }

  filasIntermediarios.delete(canalId);
}

// =====================================================
// COMANDOS DE MENSAJES
// =====================================================

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const comando =
    message.content.trim();

  console.log(
    `📩 Mensaje: "${comando}" | Canal: ${message.channel.id}`
  );

  // ===================================================
  // !TRUCO
  // ===================================================

  if (comando === PREFIX) {
    if (message.channel.id !== CANAL_FILA_ID) {
      return;
    }

    if (!puedeCrearFila(message.member)) {
      return message.reply(
        "❌ No tenés permiso para crear una fila."
      );
    }

    try {
      const msg =
        await message.channel.send({
          embeds: [
            crearEmbedFila(),
          ],
          components: [
            botonesTripleFila(),
          ],
        });

      estadosFilas.set(msg.id, {
        f1: null,
        f2: null,
        f3: null,
      });

      console.log(
        `✅ Fila creada: ${msg.id}`
      );

    } catch (error) {
      console.error(
        "❌ Error al crear fila:",
        error
      );
    }

    return;
  }

  // ===================================================
  // !CLOSE EN CANAL PRIVADO
  // ===================================================

  if (comando === CLOSE_COMMAND) {
    // No permitir cerrar desde la fila general
    if (
      message.channel.id === CANAL_FILA_ID ||
      message.channel.id === CANAL_INTERMEDIARIOS_ID
    ) {
      return;
    }

    // Solo canales de texto
    if (
      message.channel.type !==
      ChannelType.GuildText
    ) {
      return;
    }

    if (!tienePermisoStaff(message.member)) {
      return message.reply(
        "❌ No tenés permiso para cerrar esta mesa."
      );
    }

    const canalPartida =
      message.channel;

    try {
      await message.reply(
        "⏳ Guardando la transcripción y cerrando la mesa..."
      );

      const attachment =
        await discordTranscripts.createTranscript(
          canalPartida,
          {
            limit: -1,
            fileName:
              `mesa-${canalPartida.id}-${Date.now()}.html`,
            saveImages: true,
            poweredBy: false,
          }
        );

      const logChannel =
        await message.guild.channels.fetch(
          LOG_CHANNEL_ID
        );

      if (
        !logChannel ||
        !logChannel.isTextBased()
      ) {
        throw new Error(
          "El canal de logs no existe o no es de texto."
        );
      }

      await logChannel.send({
        content:
          `📝 **MESA CERRADA CON !close**\n\n` +
          `📌 Canal: \`${canalPartida.name}\`\n` +
          `👤 Cerrada por: <@${message.author.id}>`,

        files: [
          attachment,
        ],
      });

      await borrarAvisoIntermediario(
        message.guild,
        canalPartida.id
      );

      await canalPartida.send(
        "✅ Transcripción guardada. La mesa se cerrará en 3 segundos."
      );

      setTimeout(async () => {
        try {
          if (canalPartida.deletable) {
            await canalPartida.delete();
          }
        } catch (error) {
          console.error(
            "❌ Error al eliminar canal:",
            error
          );
        }
      }, 3000);

    } catch (error) {
      console.error(
        "❌ ERROR AL EJECUTAR !close:",
        error
      );

      await message.reply(
        "❌ Ocurrió un error al guardar el HTML o cerrar la mesa."
      ).catch(() => {});
    }

    return;
  }
});

// =====================================================
// INTERACCIONES
// =====================================================

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  // ===================================================
  // TOMAR FILA
  // ===================================================

  if (
    interaction.customId.startsWith(
      "tomar_fila_"
    )
  ) {
    const canalId =
      interaction.customId.replace(
        "tomar_fila_",
        ""
      );

    const fila =
      filasIntermediarios.get(canalId);

    if (!fila) {
      return interaction.reply({
        content:
          "❌ Esta fila ya no está disponible.",
        ephemeral: true,
      });
    }

    const intermediario =
      METODOS_INTERMEDIARIOS[
        interaction.user.id
      ];

    if (!intermediario) {
      return interaction.reply({
        content:
          "❌ No estás autorizado como intermediario.",
        ephemeral: true,
      });
    }

    if (fila.intermediarioId) {
      return interaction.reply({
        content:
          "⚠️ Esta fila ya fue tomada por otro intermediario.",
        ephemeral: true,
      });
    }

    fila.intermediarioId =
      interaction.user.id;

    const canalPartida =
      await interaction.guild.channels.fetch(
        canalId
      ).catch(() => null);

    if (!canalPartida) {
      filasIntermediarios.delete(canalId);

      return interaction.reply({
        content:
          "❌ El canal de la partida no existe.",
        ephemeral: true,
      });
    }

    await interaction.update({
      embeds: [
        new EmbedBuilder()
          .setColor(0x808080)
          .setTitle("🤝 FILA TOMADA")
          .setDescription(
            `✅ **Intermediario asignado:** <@${interaction.user.id}>

🃏 La partida ya tiene un intermediario.`
          ),
      ],
      components: [],
    });

    const datosPago =
      crearDatosPago(intermediario);

    await canalPartida.send({
      embeds: [
        new EmbedBuilder()
          .setColor(0x00AE86)
          .setTitle("🤝 INTERMEDIARIO ASIGNADO")
          .setDescription(
            `🎴 **El intermediario de esta partida es:**

<@${interaction.user.id}>

━━━━━━━━━━━━━━━━━━

💰 **DATOS DE PAGO**

${datosPago}

━━━━━━━━━━━━━━━━━━

✅ Ya pueden coordinar la partida con el intermediario.`
          ),
      ],
    });

    return;
  }

  // ===================================================
  // LEVANTAR MESA
  // ===================================================

  if (
    interaction.customId === "cerrar_partida"
  ) {
    if (
      !tienePermisoStaff(
        interaction.member
      )
    ) {
      return interaction.reply({
        content:
          "❌ No tenés permiso para cerrar la mesa.",
        ephemeral: true,
      });
    }

    const canalDestino =
      interaction.channel;

    await interaction.reply({
      content:
        "⏳ Guardando la transcripción...",
      ephemeral: true,
    });

    try {
      const attachment =
        await discordTranscripts.createTranscript(
          canalDestino,
          {
            limit: -1,
            fileName:
              `mesa-${canalDestino.id}-${Date.now()}.html`,
            saveImages: true,
            poweredBy: false,
          }
        );

      const logChannel =
        await interaction.guild.channels.fetch(
          LOG_CHANNEL_ID
        );

      if (
        !logChannel ||
        !logChannel.isTextBased()
      ) {
        throw new Error(
          "Canal de logs no encontrado."
        );
      }

      await logChannel.send({
        content:
          `📝 **MESA FINALIZADA**\n\n` +
          `📌 Sala: \`${canalDestino.name}\`\n` +
          `👤 Cerrada por: <@${interaction.user.id}>`,

        files: [
          attachment,
        ],
      });

      await borrarAvisoIntermediario(
        interaction.guild,
        canalDestino.id
      );

      await canalDestino.send(
        "✅ Registro guardado. La mesa se cerrará en 3 segundos."
      );

      setTimeout(async () => {
        try {
          if (canalDestino.deletable) {
            await canalDestino.delete();
          }
        } catch (error) {
          console.error(
            "❌ Error al eliminar mesa:",
            error
          );
        }
      }, 3000);

    } catch (error) {
      console.error(
        "❌ Error al guardar transcripción:",
        error
      );

      await interaction.followUp({
        content:
          "❌ No se pudo guardar la transcripción.",
        ephemeral: true,
      }).catch(() => {});
    }

    return;
  }

  // ===================================================
  // BOTONES DE FILA
  // ===================================================

  const data =
    estadosFilas.get(
      interaction.message.id
    );

  if (!data) {
    return interaction.reply({
      content:
        "❌ Fila no encontrada.",
      ephemeral: true,
    });
  }

  const userId =
    interaction.user.id;

  // ===================================================
  // SALIR DE FILA
  // ===================================================

  if (
    interaction.customId === "salir_fila"
  ) {
    if (data.f1 === userId) {
      data.f1 = null;
    }

    if (data.f2 === userId) {
      data.f2 = null;
    }

    if (data.f3 === userId) {
      data.f3 = null;
    }

    return interaction.update({
      embeds: [
        crearEmbedFila(data),
      ],
    });
  }

  // ===================================================
  // IDENTIFICAR MESA
  // ===================================================

  const mapping = {
    btn_f1: "f1",
    btn_f2: "f2",
    btn_f3: "f3",
  };

  const filaKey =
    mapping[interaction.customId];

  if (!filaKey) return;

  // ===================================================
  // EVITAR DOS MESAS
  // ===================================================

  if (
    data.f1 === userId ||
    data.f2 === userId ||
    data.f3 === userId
  ) {
    if (data[filaKey] !== userId) {
      return interaction.reply({
        content:
          "⚠️ Ya estás sentado en una mesa.",
        ephemeral: true,
      });
    }
  }

  // ===================================================
  // SENTARSE EN MESA VACÍA
  // ===================================================

  if (!data[filaKey]) {
    data[filaKey] = userId;

    return interaction.update({
      embeds: [
        crearEmbedFila(data),
      ],
    });
  }

  // ===================================================
  // YA ESTÁ SENTADO
  // ===================================================

  if (data[filaKey] === userId) {
    return interaction.reply({
      content:
        "⚠️ Ya estás sentado en esta mesa.",
      ephemeral: true,
    });
  }

  // ===================================================
  // CREAR PARTIDA
  // ===================================================

  const rivalId =
    data[filaKey];

  data[filaKey] = null;

  await interaction.update({
    embeds: [
      crearEmbedFila(data),
    ],
  });

  try {
    await crearCanalPrivado(
      interaction,
      [
        rivalId,
        userId,
      ]
    );
  } catch (error) {
    console.error(
      "❌ Error al crear partida:",
      error
    );
  }
});

// =====================================================
// CREAR CANAL PRIVADO
// =====================================================

async function crearCanalPrivado(
  interaction,
  jugadores
) {
  const guild =
    interaction.guild;

  const parent =
    interaction.channel.parent;

  const nombres =
    jugadores
      .map((id) => {
        const member =
          guild.members.cache.get(id);

        return (
          member?.user.username ||
          "jugador"
        );
      })
      .join("-vs-")
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 80);

  const canal =
    await guild.channels.create({
      name: `🃏┃${nombres}`,
      type: ChannelType.GuildText,
      parent,

      permissionOverwrites: [
        {
          id: guild.id,
          deny: [
            PermissionsBitField.Flags.ViewChannel,
          ],
        },

        {
          id: STAFF_ROLE_ID,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
          ],
        },

        {
          id: EXTRA_MOD_ROLE_ID,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
          ],
        },

        ...jugadores.map((id) => ({
          id,

          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
          ],
        })),
      ],
    });

  // ===================================================
  // EMBED DE LA PARTIDA
  // ===================================================

  const embedMatch =
    new EmbedBuilder()
      .setColor(0x2f3136)
      .setTitle(
        `${EMOJI_FUEGO} ¡DUELO DE TRUCO INICIADO!`
      )
      .setDescription(
        `🎴 **LOS DESAFIANTES**

<@${jugadores[0]}> **v.s** <@${jugadores[1]}>

━━━━━━━━━━━━━━━━━━

🔹 ¡Buena suerte a ambos!

━━━━━━━━━━━━━━━━━━`
      );

  await canal.send({
    content:
      `${jugadores
        .map((id) => `<@${id}>`)
        .join(" ")} | ` +
      `<@&${STAFF_ROLE_ID}> <@&${EXTRA_MOD_ROLE_ID}>`,

    embeds: [
      embedMatch,
    ],

    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(
            "cerrar_partida"
          )
          .setLabel(
            "LEVANTAR MESA"
          )
          .setEmoji("🤝")
          .setStyle(
            ButtonStyle.Danger
          )
      ),
    ],
  });

  // ===================================================
  // REGLAS
  // ===================================================

  await canal.send({
    embeds: [
      embedPagos(),
    ],
  });

  // ===================================================
  // AVISO A INTERMEDIARIOS
  // ===================================================

  await avisarIntermediarios(
    interaction,
    jugadores,
    canal
  );
}

// =====================================================
// BOT CONECTADO
// =====================================================

client.once("ready", () => {
  console.log(
    `🃏 Bot conectado correctamente: ${client.user.tag}`
  );
});

client.login(process.env.TOKEN);