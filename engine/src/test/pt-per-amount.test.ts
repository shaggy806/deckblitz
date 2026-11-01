/**
 * `grantPtPerCount`'s counts relative to the affected permanent, each by its
 * own, and the other amounts a static P/T bonus reads: Auras and Equipment
 * attached to it, others that share a creature type with it, its mana value,
 * colors and creature types, counters over a set or on the source, a turn stat,
 * domain, and a count divided or capped.
 */
import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import { createDefaultRegistry } from "../cards/registry.js";
import { Game } from "../game.js";
import { asPlayerId } from "../primitives.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  counters,
  destroy,
  enter,
  keywords,
  lands,
  pt,
  spawn,
  table,
  toGraveyard,
  toLibrary,
} from "./harness.js";

/** `aura` or `equipment`, on the battlefield, attached to `host` (silently). */
const attach = (game: Game, name: string, host: ObjectId, player = A): ObjectId => {
  const id = spawn(game, name, player);
  game.state.objects[id].attachedTo = host;
  return id;
};

describe("Auras and Equipment attached to the affected creature", () => {
  it("Thran Power Suit counts what's on the equipped creature, itself included, and grants ward", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const suit = attach(game, "Thran Power Suit", bears);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    const aura = attach(game, "Eternal Warrior", bears);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    // An Equipment elsewhere isn't on it.
    const giant = spawn(game, "Hill Giant");
    attach(game, "Runed Stalactite", giant);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    destroy(game, aura);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(suit).toBeDefined();
  });

  it("Auramancer's Guise counts Auras on the creature, not Equipment, and gives vigilance", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    attach(game, "Auramancer's Guise", bears);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("vigilance")).toBe(true);
    attach(game, "Runed Stalactite", bears); // its own +1/+1, not a +2/+2
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    attach(game, "Eternal Warrior", bears);
    expect(pt(game, bears)).toEqual({ power: 7, toughness: 7 });
  });

  it("Champion of the Flame counts both on itself", () => {
    const { game } = table();
    const champion = spawn(game, "Champion of the Flame");
    expect(pt(game, champion)).toEqual({ power: 1, toughness: 1 });
    attach(game, "Eternal Warrior", champion);
    attach(game, "Civic Saber", champion);
    expect(pt(game, champion)).toEqual({ power: 6, toughness: 5 }); // red: +1/+0 from the Saber
  });
});

describe("others relative to the affected creature", () => {
  it("Sliver Legion: each Sliver counts every Sliver but itself, wherever they are", () => {
    const { game } = table();
    const legion = spawn(game, "Sliver Legion");
    expect(pt(game, legion)).toEqual({ power: 7, toughness: 7 });
    const mine = spawn(game, "Homing Sliver");
    const theirs = spawn(game, "Homing Sliver", B);
    expect(pt(game, legion)).toEqual({ power: 9, toughness: 9 });
    expect(pt(game, mine)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, theirs)).toEqual({ power: 4, toughness: 4 });
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("Coat of Arms: each creature by those that share a creature type with it, changelings with all", () => {
    const { game } = table();
    spawn(game, "Coat of Arms");
    const looter = spawn(game, "Merfolk Looter"); // Merfolk Rogue
    const historian = spawn(game, "Deeproot Historian"); // Merfolk Druid
    const mystic = spawn(game, "Elvish Mystic"); // Elf Druid
    const giant = spawn(game, "Hill Giant", B); // Giant
    expect(pt(game, looter)).toEqual({ power: 2, toughness: 2 }); // the Historian
    expect(pt(game, historian)).toEqual({ power: 5, toughness: 5 }); // the Looter and the Mystic
    expect(pt(game, mystic)).toEqual({ power: 2, toughness: 2 }); // the Historian
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 3 }); // nobody
    const changeling = spawn(game, "Woodland Changeling"); // every type: 2/2
    expect(pt(game, changeling)).toEqual({ power: 6, toughness: 6 });
    expect(pt(game, giant)).toEqual({ power: 4, toughness: 4 });
  });

  it("Alpha Status: the enchanted creature only", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant");
    const other = spawn(game, "Hill Giant", B);
    spawn(game, "Grizzly Bears");
    attach(game, "Alpha Status", giant);
    expect(pt(game, giant)).toEqual({ power: 5, toughness: 5 });
    expect(pt(game, other)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("what the affected creature itself has", () => {
  it("Hedron Matrix: its mana value", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant"); // {3}{R}
    attach(game, "Hedron Matrix", giant);
    expect(pt(game, giant)).toEqual({ power: 7, toughness: 7 });
  });

  it("Civic Saber: its colors, none for a colorless one", () => {
    const { game } = table();
    const knight = spawn(game, "Knight of New Alara");
    const thopter = spawn(game, "Ornithopter");
    attach(game, "Civic Saber", knight);
    attach(game, "Civic Saber", thopter);
    expect(pt(game, knight)).toEqual({ power: 4, toughness: 2 });
    expect(pt(game, thopter)).toEqual({ power: 0, toughness: 2 });
  });

  it("Knight of New Alara: other multicolored creatures you control, by their own colors", () => {
    const { game } = table();
    const knight = spawn(game, "Knight of New Alara");
    const legion = spawn(game, "Sliver Legion");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Knight of New Alara", B);
    expect(pt(game, knight)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, legion)).toEqual({ power: 12, toughness: 12 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("other amounts", () => {
  it("Mycosynth Fiend: the poison counters every opponent has, not yours", () => {
    const { game } = table({ players: 3 });
    const fiend = spawn(game, "Mycosynth Fiend");
    game.state.players[A].counters.poison = 5;
    game.state.players[B].counters.poison = 2;
    game.state.players[game.state.turnOrder[2]].counters.poison = 1;
    expect(pt(game, fiend)).toEqual({ power: 5, toughness: 5 });
  });

  it("Gleam of Authority: the +1/+1 counters on the others, not on the enchanted creature", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Hill Giant", B);
    attach(game, "Gleam of Authority", bears);
    game.state.objects[bears].counters["+1/+1"] = 3;
    game.state.objects[giant].counters["+1/+1"] = 2;
    game.state.objects[theirs].counters["+1/+1"] = 4;
    // 2/2, its own three counters, and the Giant's two.
    expect(pt(game, bears)).toEqual({ power: 7, toughness: 7 });
    expect(keywords(game, bears).has("vigilance")).toBe(true);
  });

  it("Knowledge Is Power: the cards you've drawn this turn, and they wear off", () => {
    const { game } = table();
    spawn(game, "Knowledge Is Power");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    toLibrary(game, "Wastes");
    const base = game.state.players[A].cardsDrawnThisTurn;
    expect(pt(game, bears)).toEqual({ power: 2 + base, toughness: 2 + base });
    game.state.players[A].cardsDrawnThisTurn = base + 2;
    expect(pt(game, bears)).toEqual({ power: 4 + base, toughness: 4 + base });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });

  it("Kyler: every counter on her, of any kind, for the other Humans", () => {
    const { game } = table();
    const kyler = spawn(game, "Kyler, Sigardian Emissary");
    const bears = spawn(game, "Grizzly Bears");
    const champion = spawn(game, "Champion of the Flame"); // a Human
    game.state.objects[kyler].counters["+1/+1"] = 1;
    game.state.objects[kyler].counters.charge = 2;
    expect(pt(game, champion)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    // Other Humans: not herself, whose +1/+1 counter counts as a counter.
    expect(pt(game, kyler)).toEqual({ power: 3, toughness: 3 });
  });

  it("Kyler's trigger: another Human you control entering puts a counter on her", () => {
    const { game } = table();
    const kyler = spawn(game, "Kyler, Sigardian Emissary");
    enter(game, "Knight of New Alara");
    expect(counters(game, kyler)).toBe(1);
    enter(game, "Grizzly Bears");
    expect(counters(game, kyler)).toBe(1);
  });

  it("Manaforce Mace: the basic land types among lands you control", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    attach(game, "Manaforce Mace", bears);
    lands(game, "Forest", 2);
    lands(game, "Island", 1);
    lands(game, "Mountain", 1, B);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });

  it("Dark Matter Manipulator: +2/+0 for every seven cards, rounded down", () => {
    const { game } = table();
    const dark = spawn(game, "Dark Matter Manipulator");
    for (let i = 0; i < 6; i += 1) toGraveyard(game, "Wastes");
    toGraveyard(game, "Wastes", B);
    expect(pt(game, dark)).toEqual({ power: 1, toughness: 2 });
    toGraveyard(game, "Wastes");
    expect(pt(game, dark)).toEqual({ power: 3, toughness: 2 });
    for (let i = 0; i < 6; i += 1) toGraveyard(game, "Wastes");
    expect(pt(game, dark)).toEqual({ power: 3, toughness: 2 });
  });

  it("Disturbing Conversion: the cards in the enchanted creature's controller's graveyard, whoever's Aura it is", () => {
    const { game } = table();
    const theirs = spawn(game, "Hill Giant", B);
    attach(game, "Disturbing Conversion", theirs);
    toGraveyard(game, "Wastes");
    toGraveyard(game, "Wastes");
    toGraveyard(game, "Wastes", B);
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 3 });
  });

  it("creature types to a maximum (Diligent Zookeeper's shape), and opponents still in the game (Blazing Sunsteel's)", () => {
    const registry = createDefaultRegistry();
    registry.register(
      defineCard({
        name: "Test Zookeeper",
        manaCost: "{0}",
        types: ["enchantment"],
        text: "Creatures you control get +1/+1 for each of their creature types, to a maximum of 10.",
        static: [
          {
            affects: { scope: "creatures-you-control" },
            grantPtPerCount: { ofAffected: "creature-types", max: 10, pt: [1, 1] },
            text: "Creatures you control get +1/+1 for each of their creature types, to a maximum of 10.",
          },
        ],
      }),
    );
    registry.register(
      defineCard({
        name: "Test Sunsteel",
        manaCost: "{0}",
        types: ["enchantment"],
        text: "Creatures you control get +1/+0 for each opponent you have.",
        static: [
          {
            affects: { scope: "creatures-you-control" },
            grantPtPerCount: { opponents: true, pt: [1, 0] },
            text: "Creatures you control get +1/+0 for each opponent you have.",
          },
        ],
      }),
    );
    const seats = [A, B, asPlayerId("carol")];
    const game = Game.create({
      seed: 1,
      shuffle: false,
      startingPlayer: A,
      registry,
      rules: { maxLandsPerTurn: 99, skipFirstDraw: false, maxHandSize: 99 },
      decks: seats.map((player) => ({ player, cards: Array<string>(40).fill("Wastes") })),
    });
    game.advanceUntil((s) => s.turn.step === "precombat-main" && s.priority.holder === A);
    spawn(game, "Test Zookeeper");
    const mystic = spawn(game, "Elvish Mystic"); // Elf Druid, 1/1
    const changeling = spawn(game, "Woodland Changeling"); // every type, 2/2
    expect(pt(game, mystic)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, changeling)).toEqual({ power: 12, toughness: 12 });
    spawn(game, "Test Sunsteel");
    expect(pt(game, mystic)).toEqual({ power: 5, toughness: 3 });
    game.state.players[B].hasLost = true;
    expect(pt(game, mystic)).toEqual({ power: 4, toughness: 3 });
  });

  it("the Gleam's granted bolster works from the enchanted creature", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A, { sick: false });
    const small = spawn(game, "Elvish Mystic");
    attach(game, "Gleam of Authority", bears);
    lands(game, "Plains", 1);
    activate(game, bears, 0);
    expect(counters(game, small)).toBe(1);
    // That counter's on another creature, so the Gleam reads it.
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
  });
});
