/**
 * Protection worked out from the game, and chosen or granted by a spell:
 * Commander's Plate's "each color that's not in your commander's color
 * identity" (`protection.outsideCommanderIdentity`, rules 702.16, 903.4,
 * 903.4f), Mother of Runes' colour of your choice, Eldritch Immunity's each
 * color, targeted or overloaded (rule 702.96).
 */
import { describe, expect, it } from "vitest";
import { ScriptedController } from "../controller.js";
import { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, activate, blockOffer, cast, lands, pickModes, pt, ref, settle, spawn, table, toHand, zone } from "./harness.js";

/** Alice's seat in the game `commanderGame` last made. */
let seat: ScriptedController;

/** Alice at her precombat main, with these commanders and Bob with his. */
const commanderGame = (mine: readonly string[], his: readonly string[] = []): Game => {
  seat = new ScriptedController(A);
  const game = Game.create({
    seed: 1,
    shuffle: false,
    startingPlayer: A,
    rules: { skipFirstDraw: false, maxLandsPerTurn: 99, maxHandSize: 99 },
    controllers: { [A]: seat, [B]: new ScriptedController(B) },
    decks: [
      { player: A, cards: Array<string>(40).fill("Wastes"), ...(mine.length > 0 ? { commanders: [...mine] } : {}) },
      { player: B, cards: Array<string>(40).fill("Wastes"), ...(his.length > 0 ? { commanders: [...his] } : {}) },
    ],
  });
  game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "precombat-main" && s.priority.holder === A);
  return game;
};

/** Grizzly Bears wearing a Commander's Plate, by Equip {5}. */
const platedBears = (game: Game): { bears: ObjectId; plate: ObjectId } => {
  const bears = spawn(game, "Grizzly Bears");
  const plate = spawn(game, "Commander's Plate");
  lands(game, "Wastes", 5);
  activate(game, plate, 1, { targets: [ref(bears)] });
  expect(game.state.objects[plate].attachedTo).toBe(bears);
  return { bears, plate };
};

/** Whether a spell of each colour may target `creature`, in W U B R G order. */
const COLOR_SPELLS: readonly (readonly [string, string])[] = [
  ["W", "Swords to Plowshares"],
  ["U", "Unsummon"],
  ["B", "Doom Blade"],
  ["R", "Lightning Bolt"],
  ["G", "Giant Growth"],
];
const LAND_FOR: Readonly<Record<string, string>> = { W: "Plains", U: "Island", B: "Swamp", R: "Mountain", G: "Forest" };
const targetableBy = (game: Game, creature: ObjectId, player: PlayerId = A): string[] => {
  const colors: string[] = [];
  for (const [color, spell] of COLOR_SPELLS) {
    lands(game, LAND_FOR[color], 2, player);
    const card = toHand(game, spell, player);
    if (game.canDispatch({ type: "cast-spell", player, card, targets: [ref(creature)] }) === null) colors.push(color);
  }
  return colors;
};

describe("protection from each color outside your commander's color identity", () => {
  it("a mono-white commander: +3/+3 and protection from the other four", () => {
    const game = commanderGame(["Isamaru, Hound of Konda"]);
    const { bears } = platedBears(game);
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(targetableBy(game, bears)).toEqual(["W"]);
  });

  it("two commanders: outside both together", () => {
    const game = commanderGame(["Krark, the Thumbless", "Sakashima of a Thousand Faces"]);
    const { bears } = platedBears(game);
    expect(targetableBy(game, bears)).toEqual(["U", "R"]);
  });

  it("a commander with no colors in its identity: protection from each color", () => {
    const game = commanderGame(["Ornithopter"]);
    const { bears } = platedBears(game);
    expect(targetableBy(game, bears)).toEqual([]);
  });

  it("no commander: no protection, and still +3/+3 (rule 903.4f)", () => {
    const game = commanderGame([]);
    const { bears } = platedBears(game);
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(targetableBy(game, bears)).toEqual(["W", "U", "B", "R", "G"]);
  });

  it("reads the Plate's controller, so it changes with control of the Plate", () => {
    const game = commanderGame(["Isamaru, Hound of Konda"], ["Krark, the Thumbless"]);
    const { bears, plate } = platedBears(game);
    game.state.objects[plate].controller = B;
    expect(targetableBy(game, bears)).toEqual(["R"]);
  });

  it("stops damage from what it's protected from, beside a creature it isn't on", () => {
    const game = commanderGame(["Isamaru, Hound of Konda"]);
    const { bears } = platedBears(game);
    const bare = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Anger of the Gods"));
    expect(game.state.objects[bears].damageMarked).toBe(0);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, bare)).not.toBe("battlefield");
  });

  it("a blocker of a color it's protected from isn't offered", () => {
    const game = commanderGame(["Isamaru, Hound of Konda"]);
    const { bears } = platedBears(game);
    const blue = spawn(game, "Merfolk of the Pearl Trident", B);
    const white = spawn(game, "Savannah Lions", B);
    const offer = blockOffer(game, seat, [bears]);
    const blockers = offer.eligible.map((e) => e.blocker);
    expect(blockers).toContain(white);
    expect(blockers).not.toContain(blue);
  });

  it("Equip commander {3} attaches to a commander of yours and nothing else", () => {
    const game = commanderGame(["Isamaru, Hound of Konda"]);
    const hound = Object.values(game.state.objects).find((o) => o.isCommander === true && o.owner === A)!.id;
    lands(game, "Plains", 1);
    cast(game, hound);
    expect(zone(game, hound)).toBe("battlefield");
    const bears = spawn(game, "Grizzly Bears");
    const plate = spawn(game, "Commander's Plate");
    lands(game, "Wastes", 3);
    expect(game.canDispatch({ type: "activate-ability", player: A, source: plate, abilityIndex: 0, targets: [ref(bears)] })).not.toBeNull();
    activate(game, plate, 0, { targets: [ref(hound)] });
    expect(game.state.objects[plate].attachedTo).toBe(hound);
    expect(pt(game, hound)).toEqual({ power: 5, toughness: 5 });
    expect(targetableBy(game, hound)).toEqual(["W"]);
  });
});

describe("Mother of Runes", () => {
  it("gives the colour chosen as it resolves, until end of turn, to a creature you control", () => {
    const { game, a } = table();
    const mother = spawn(game, "Mother of Runes");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    expect(game.canDispatch({ type: "activate-ability", player: A, source: mother, abilityIndex: 0, targets: [ref(theirs)] })).not.toBeNull();
    // The five colours, as Gods Willing's: red is the fourth.
    pickModes(a, 3);
    activate(game, mother, 0, { targets: [ref(bears)] });
    expect(game.state.objects[mother].tapped).toBe(true);
    expect(targetableBy(game, bears)).toEqual(["W", "U", "B", "G"]);
  });

  it("can't be used the turn it came, for its tap", () => {
    const { game } = table();
    const mother = game.debugSpawn("Mother of Runes", A, "battlefield", { summoningSick: true });
    expect(game.canDispatch({ type: "activate-ability", player: A, source: mother, abilityIndex: 0, targets: [ref(mother)] })).not.toBeNull();
  });
});

describe("Eldritch Immunity", () => {
  it("for {C}: one target creature of yours, protected from each color", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Hill Giant", B);
    lands(game, "Wastes", 1);
    const spell = toHand(game, "Eldritch Immunity");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: spell, targets: [ref(theirs)] })).not.toBeNull();
    cast(game, spell, { targets: [ref(bears)] });
    expect(targetableBy(game, bears)).toEqual([]);
    expect(targetableBy(game, other)).toEqual(["W", "U", "B", "R", "G"]);
  });

  it("overloaded for {4}{C}: each creature you control and no target, so none of an opponent's", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Hill Giant", B);
    lands(game, "Wastes", 5);
    const spell = toHand(game, "Eldritch Immunity");
    const offer = game.legalActions(A).find((a) => a.kind === "cast-spell" && a.card === spell && a.overload === true);
    expect(offer?.kind === "cast-spell" && offer.targetSpecs).toEqual([]);
    game.dispatch({ type: "cast-spell", player: A, card: spell, overload: true, targets: [] });
    settle(game);
    expect(targetableBy(game, bears)).toEqual([]);
    expect(targetableBy(game, giant)).toEqual([]);
    expect(targetableBy(game, theirs)).toEqual(["W", "U", "B", "R", "G"]);
  });

  it("is a Kindred Eldrazi instant of no colour", () => {
    const { game } = table();
    const def = game.registry.get("Eldritch Immunity");
    expect(def.types).toEqual(["kindred", "instant"]);
    expect(def.subtypes).toEqual(["Eldrazi"]);
    expect(def.colors).toEqual([]);
  });
});
