const client = require("..");
const { cooldown } = require("../handlers/functions");

client.on("interactionCreate", async (interaction) => {
  // Slash Command Handling
  if (interaction.isCommand()) {
    await interaction
      .deferReply({
        ephemeral: false,
      })
      .catch((e) => {});
    let prefix = "/";
    const cmd = client.commands.get(interaction.commandName);
    if (!cmd) return interaction.followUp({ content: "An error has occured " });

    const args = [];

    for (let option of interaction.options.data) {
      if (option.type === "SUB_COMMAND") {
        if (option.name) args.push(option.name);
        option.options?.forEach((x) => {
          if (x.value) args.push(x.value);
        });
      } else if (option.value) args.push(option.value);
    }
    interaction.member = interaction.guild.members.cache.get(
      interaction.user.id
    );
    if (cmd) {
      // checking user perms
      if (!interaction.member.permissions.has(cmd.userPermissions || [])) {
        return client.embed(
          interaction,
          `You Don't Have \`${cmd.userPermissions}\` Permission to Use \`${cmd.name}\` Command!!`
        );
      } else if (
        !interaction.guild.me.permissions.has(cmd.botPermissions || [])
      ) {
        return client.embed(
          interaction,
          `I Don't Have \`${cmd.botPermissions}\` Permission to Use \`${cmd.name}\` Command!!`
        );
      } else if (cooldown(interaction, cmd)) {
        return client.embed(
          interaction,
          ` You are On Cooldown , wait \`${cooldown(
            interaction,
            cmd
          ).toFixed()}\` Seconds`
        );
      } else {
        cmd.run({ client, interaction, args, prefix });
      }
    }
  }

  if(interaction.isButton()){
    if(interaction.customId === "t-cr"){
      interaction.guild.channels.create(`Ticket - ${interaction.member.id}`,{
        type: "GUILD_TEXT",
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone,
            deny: "VIEW_CHANNEL"
          },
          {
            id: interaction.user.id,
            allow: "VIEW_CHANNEL",
            deny: ["MANAGE_CHANNELS", "EMBED_LINKS", "ADD_REACTIONS", "MANAGE_MESSAGES"]
          },
        ],
        reason: `Ticket Opened By ${interaction.user.tag}`
      }).then(ch => {
        let embed = new MessageEmbed()
        .setColor("BLUE")
        .setDescription(`<:sh_tick:958961439853395988> **Created A Ticket ${ch}**`)
        interaction.reply({embeds: [embed], ephemeral: true})
        let button = new MessageActionRow().addComponents(
          new MessageButton()
          .setEmoji("🗳")
          .setCustomId("tc-cl")
          .setStyle("PRIMARY")
          
        )
         ch.send({
          embeds: [
            new Discord.MessageEmbed()
            .setColor("BLUE")
            .setTitle(`Welcome`)
            .setDescription(`**Hey ${interaction.user} Welcome, 
            Staff will Be Soon here to Close The ticket Click on 🔒**`)
          ],
          content: `Welcome ${interaction.user}`,
          components: [button]
        })
        
        
      })
    }
  }

  // Context Menu Handling
  if (interaction.isContextMenu()) {
    await interaction.deferReply({ ephemeral: false });
    const command = client.commands.get(interaction.commandName);
    if (command) command.run(client, interaction);
  }
});
