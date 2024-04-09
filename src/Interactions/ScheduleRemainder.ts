import Eris, { Constants, Guild, GuildChannel } from 'eris';
import { Team } from 'heroeslounge-api';
import { Match } from 'heroeslounge-api';
import BaseInteraction from '../Classes/BaseInteraction';
import HeroesLoungeApi from '../Classes/HeroesLounge';
import { defaultServer } from '../config';
import { Logger } from '../util';
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

export default class ScheduleRemainder extends BaseInteraction {
  message: string;

  constructor() {
    const name = 'ScheduleRemainder';
    const description = 'Remind the captains who did not schedule their incoming matches.';
    const type = Eris.Constants.ApplicationCommandTypes.CHAT_INPUT;
    const options: Eris.ApplicationCommandOptions[] = [
      {
        name: 'round',
        description: 'Current round of the season.',
        type: Constants.ApplicationCommandOptionTypes.STRING,
        required: false,
      }
    ];

    super(name, description, options, type);

    this.message = "Hello! We noticed you haven't scheduled your round " + options.pop() + " match yet. Remember that if this match is not scheduled before 23:55 CET today, your team will be automatically listed as inactive and will not be assigned an opponent for the next round. If you are having issues contacting your opponent or scheduling your match, please let me know.";
  }
  
  async execute (interaction: Eris.CommandInteraction) {
    await interaction.acknowledge(Constants.MessageFlags.EPHEMERAL);

    if (!(interaction.channel instanceof GuildChannel) || interaction.channel.guild.id !== defaultServer) {
      return interaction.createFollowup({
        content: 'Invalid guild',
        flags: Constants.MessageFlags.EPHEMERAL,
      });
    }

    const guild = interaction.channel.guild;
    const response = await this.syncCaptains(guild);

    return interaction.createFollowup({
      content: `Updated captains: ${response.updatedCaptainCounter}\nErrors:\n${response.errorMessage}`,
      flags: Constants.MessageFlags.EPHEMERAL
    });    
  }

  async syncCaptains(guild: Guild) {
    Logger.info('Synchronising captain roles');
    const teams = await this.getUnscheduledMatchTeams();

    let errorMessage = '';
    const syncedSloths = [];

    const captainRole = guild.roles.find((role) => {
      return role.name === 'Captains';
    });

    if (!captainRole) {
      return {
        updatedCaptainCounter: 0,
        errorMessage: 'Unknown \'Captains\' role',
      };
    }

    for (const team of teams) {
      if (!team.sloths || team.sloths.length === 0 || team.disbanded === 1) {
        errorMessage += `No sloths for ${team.title}\n`;
        continue;
      }

      const captainSloth = team.sloths.find(sloth => sloth.pivot.is_captain === 1);
      if (!captainSloth) {
        errorMessage += `No captain for ${team.title}\n`;
        continue;
      }

      if (captainSloth.discord_id.length === 0) {
        errorMessage += `No discord id for ${team.sloths[0].title} from ${team.title}\n`;
        continue;
      }

      const member = guild.members.get(captainSloth.discord_id);
      if (!member) {
        errorMessage += `Captain not on discord for ${team.title} member ${captainSloth.title}\n`;
        continue;
      }

      //discord.js function
      captainSloth.send(this.message);

      /*Logging
      const syncTask = guild.addMemberRole(captainSloth.discord_id, captainRole.id).catch((error) => {
        Logger.warn(`Unable to assign captain for team ${team.title} user ${captainSloth.title}`, error);
        errorMessage += `Unable to assign captain for team ${team.title} user ${captainSloth.title}\n`;
      });

      syncedSloths.push(syncTask);
      */
    }

    /*Logging
    return Promise.all(syncedSloths).then(() => {
      Logger.info(`Captain role synchronisation complete, updated ${syncedSloths.length} users`);
      return {
        updatedCaptainCounter: syncedSloths.length,
        errorMessage: errorMessage
      };
    });
    */
   return errorMessage;
  }
  
  async getUnscheduledMatchTeams() {
    const seasons = await HeroesLoungeApi.getSeasons().catch((error: Error) => {
      throw error;
    });
  
    const teamsByRegion: Promise<Team[]>[] = [];
    let seasonCounter = 0;
  
    for (let i = seasons.length - 1; i >= 0; i--) {
      if (seasonCounter >= 2) break;
      if (seasons[i].type !== 1) continue; // Only sync Amateur Series seasons.
  
      if (seasons[i].is_active === 1 && seasons[i].reg_open === 0) {
        teamsByRegion.push(HeroesLoungeApi.getSeasonTeams(seasons[i].id));
        seasonCounter++;
      } else if (seasons[i].is_active === 1 && seasons[i].reg_open === 1) {
        seasonCounter++;
      }
    }

    const unscheduledMatchesTeams: Match[] = [];

    //Find unscheduled matches.
    for (let i = 0; i < teamsByRegion.length; i++) {
      for (let teamNo = 0; teamNo < (await teamsByRegion[i]).length; teamNo++) {
        //Get all matches of a team.
        let team = HeroesLoungeApi.getTeamMathces((await teamsByRegion[i]).pop());

        //Check last matches if they are scheduled. If not, push in a new list.
        let match = (await team).pop();
        if (match.schedule_date === null) {
          unscheduledMatchesTeams.push(team);
        }
      }
    }

    return unscheduledMatchesTeams;
  }
}
