/**
 * False Dawn: "Until end of turn, spells and abilities you control that would
 * add colored mana instead add that much white mana. Until end of turn, you
 * may spend white mana as though it were mana of any color." A turn's
 * player effect (`ManaProductionRule.bySpellsAndAbilities`, replaced in
 * `Game.addMana` and planned by `manaOptionColoredAs` — rule 614.1a) beside
 * a timed static's `spendManaAs` of white (rule 609.4b).
 */
import { describe, expect, it } from "vitest";
import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, cast, hand, lands, nextTurn, spawn, table, toHand, toLibrary, zone } from "./harness.js";

const pool = (game: Game, player: PlayerId = A): string =>
  game.state.players[player].manaPool
    .map((u) => u.type)
    .sort()
    .join("");

const spentTypes = (game: Game, id: ObjectId): string[] =>
  (game.state.objects[id].manaSpent ?? []).map((unit) => unit.type).sort();

type Activate = Extract<LegalAction, { kind: "activate-ability" }>;
/** Taps a permanent for mana by hand, the way a player does. */
const tapForMana = (game: Game, land: ObjectId, player: PlayerId = A, color?: string): void => {
  const offer = game
    .legalActions(player)
    .find((a): a is Activate => a.kind === "activate-ability" && a.source === land);
  if (offer === undefined) throw new Error("no mana ability offered");
  game.dispatch({
    type: "activate-ability",
    player,
    source: land,
    abilityIndex: offer.abilityIndex,
    targets: [],
    ...(color !== undefined ? { manaColors: [color as never] } : offer.manaColors !== undefined ? { manaColors: offer.manaColors } : {}),
  });
};

/** False Dawn cast with two Plains; nothing else on the battlefield. */
function dawned(): Game {
  const { game } = table();
  lands(game, "Plains", 2);
  toLibrary(game, "Island");
  const dawn = toHand(game, "False Dawn");
  cast(game, dawn);
  expect(zone(game, dawn)).toBe("graveyard");
  return game;
}

describe("False Dawn — coloured mana made white, white spent as any colour", () => {
  it("draws a card", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const island = toLibrary(game, "Island");
    cast(game, toHand(game, "False Dawn"));
    expect(hand(game)).toContain(island);
  });

  it("a Forest taps for {W}, and that white pays a {G}", () => {
    const game = dawned();
    const [forest] = lands(game, "Forest", 1);
    tapForMana(game, forest);
    expect(pool(game)).toBe("W");
    lands(game, "Forest", 1);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    expect(spentTypes(game, bears)).toEqual(["W", "W"]);
  });

  it("the auto-payer pays a two-colour cost with the white its lands now make", () => {
    const game = dawned();
    lands(game, "Swamp", 1);
    lands(game, "Island", 1);
    const wolf = toHand(game, "Watchwolf");
    cast(game, wolf);
    expect(zone(game, wolf)).toBe("battlefield");
    expect(spentTypes(game, wolf)).toEqual(["W", "W"]);
  });

  it("a spell's mana is white too: Dark Ritual adds {W}{W}{W}", () => {
    const game = dawned();
    lands(game, "Swamp", 1);
    const ritual = toHand(game, "Dark Ritual");
    cast(game, ritual);
    expect(zone(game, ritual)).toBe("graveyard");
    expect(pool(game)).toBe("WWW");
  });

  it("an any-colour choice comes out white", () => {
    const game = dawned();
    const birds = spawn(game, "Birds of Paradise", A, { sick: false });
    tapForMana(game, birds, A, "G");
    expect(pool(game)).toBe("W");
  });

  it("colorless mana stays colorless", () => {
    const game = dawned();
    const [wastes] = lands(game, "Wastes", 1);
    tapForMana(game, wastes);
    expect(pool(game)).toBe("C");
  });

  it("lasts the turn: next turn a Forest makes {G} again", () => {
    const game = dawned();
    nextTurn(game);
    nextTurn(game);
    const [forest] = lands(game, "Forest", 1);
    tapForMana(game, forest);
    expect(pool(game)).toBe("G");
  });
});
