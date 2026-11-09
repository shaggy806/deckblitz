/**
 * A static granted by a static (`grantsStatic`), read through
 * `Game.staticsOfSource` by the rules that aren't in the layers: cost changes,
 * prohibitions and play permissions, as well as Caduceus's prevention. The
 * granted static works from the permanent that has it, and "you" is that
 * permanent's controller.
 */
import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import { createDefaultRegistry } from "../cards/registry.js";
import type { CardDefinition } from "../cards/define.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { StaticAbility } from "../cards.js";
import { A, B, cast, lands, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

const granter = (name: string, granted: StaticAbility): CardDefinition =>
  defineCard({
    name,
    manaCost: "{1}{G}",
    colors: ["G"],
    types: ["enchantment"],
    text: "Commander creatures you own have the quoted ability.",
    static: [
      {
        affects: { scope: "filter", filter: { type: "creature", isCommander: true, ownedBy: "you" } },
        grantsStatic: [granted],
        text: "Commander creatures you own have the quoted ability.",
      },
    ],
  });

const acolyte = granter("Gap Test Acolyte", {
  affects: { scope: "self" },
  costModification: { applies: { subtype: "Dragon", controlledBy: "you" }, reduceGeneric: 2, when: { firstEachTurn: true } },
  text: "The first Dragon spell you cast each turn costs {2} less to cast.",
});
const silencer = granter("Gap Test Silencer", {
  affects: { scope: "self" },
  prohibits: [{ act: "cast", who: "opponents", filter: { notTypes: ["creature"] } }],
  text: "Your opponents can't cast noncreature spells.",
});
const recycler = granter("Gap Test Recycler", {
  affects: { scope: "self" },
  mayPlay: { from: "graveyard", play: true, filter: { type: "land" } },
  text: "You may play lands from your graveyard.",
});

const board = (card: CardDefinition) => table({ registry: createDefaultRegistry().register(card) });
const commander = (game: Game, player = A): ObjectId => {
  const id = spawn(game, "Grizzly Bears", player);
  game.state.objects[id].isCommander = true;
  return id;
};

describe("a granted cost change (Acolyte of Bahamut)", () => {
  it("takes {2} off the first Dragon spell each turn, from the commander", () => {
    const { game } = board(acolyte);
    spawn(game, acolyte.name);
    commander(game);
    // Eight Mountains: the first Dragon for four leaves four, too few for a
    // second at its full six.
    lands(game, "Mountain", 8);
    const first = toHand(game, "Shivan Dragon");
    cast(game, first);
    expect(zone(game, first)).toBe("battlefield");
    expect(() => cast(game, toHand(game, "Shivan Dragon"))).toThrow(/cannot pay|mana/i);
  });

  it("does nothing without the commander it's granted to", () => {
    const { game } = board(acolyte);
    spawn(game, acolyte.name);
    spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 4);
    expect(() => cast(game, toHand(game, "Shivan Dragon"))).toThrow();
  });
});

describe("a granted prohibition", () => {
  it("binds the opponents of the commander's controller, and ends with the grant", () => {
    const { game } = board(silencer);
    const enchantment = spawn(game, silencer.name);
    commander(game);
    lands(game, "Mountain", 1, B);
    const shock = toHand(game, "Shock", B);
    game.state.priority.holder = B;
    expect(game.canDispatch({ type: "cast-spell", player: B, card: shock, targets: [{ kind: "player", player: A }] })).toMatch(/can't/);
    game.debugMove(enchantment, "graveyard");
    expect(game.canDispatch({ type: "cast-spell", player: B, card: shock, targets: [{ kind: "player", player: A }] }) ?? "").not.toMatch(/can't/);
  });
});

describe("a granted play permission", () => {
  it("lets the commander's controller play a land from their graveyard", () => {
    const { game } = board(recycler);
    spawn(game, recycler.name);
    const land = toGraveyard(game, "Forest");
    expect(game.legalActions(A).some((a) => a.kind === "play-land" && a.card === land)).toBe(false);
    commander(game);
    expect(game.legalActions(A).some((a) => a.kind === "play-land" && a.card === land)).toBe(true);
  });
});
