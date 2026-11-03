/**
 * Offering (rule 702.48): "as an additional cost to cast this spell, you may
 * sacrifice a [quality] permanent. If you chose to pay the additional cost,
 * this spell's total cost is reduced by the sacrificed permanent's mana cost,
 * and you may cast this spell any time you could cast an instant." A keyword
 * kicker (`kicker.offering`), one offer per permanent and reduction, named as
 * the cast's `sacrifice`.
 */

import { describe, expect, it } from "vitest";

import { manaCostReductions, parseManaCost } from "../mana.js";
import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  C,
  attack,
  cast,
  graveyard,
  keywords,
  lands,
  life,
  pickModes,
  pt,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;
const offers = (game: Game, card: ObjectId): CastOffer[] =>
  game.legalActions(A).filter((a): a is CastOffer => a.kind === "cast-spell" && a.card === card);
const offeringOffers = (game: Game, card: ObjectId): CastOffer[] =>
  offers(game, card).filter((a) => a.kickerKeyword === "offering");
const victims = (game: Game, card: ObjectId): (ObjectId | undefined)[] =>
  offeringOffers(game, card).map((a) => a.emergeSacrifice?.object);
const reductionText = (cost: string | null, spell: string): string[] =>
  manaCostReductions(cost, parseManaCost(spell)).map((r) => r.text);
const refusal = (game: Game, card: ObjectId, sacrifice?: ObjectId): string | null =>
  game.canDispatch({
    type: "cast-spell",
    player: A,
    card,
    targets: [],
    kicked: true,
    ...(sacrifice !== undefined ? { sacrifice } : {}),
  });

describe("offering's total cost (rule 702.48c)", () => {
  it("takes generic from generic and a colour from that colour", () => {
    const { game } = table();
    const patron = toHand(game, "Patron of the Akki"); // {4}{R}{R}
    const goblin = spawn(game, "Goblin Piker"); // {1}{R}: {3}{R} left.
    lands(game, "Mountain", 3);
    expect(refusal(game, patron, goblin)).not.toBeNull();
    expect(victims(game, patron)).toEqual([]);
    lands(game, "Mountain", 1);
    expect(refusal(game, patron, goblin)).toBeNull();
    expect(victims(game, patron)).toEqual([goblin]);
    cast(game, patron, { kicked: true, sacrifice: goblin });
    expect(zone(game, patron)).toBe("battlefield");
    expect(zone(game, goblin)).toBe("graveyard");
  });

  it("a colour the spell doesn't ask for comes off the generic, not its own pips (rule 118.7b)", () => {
    const { game } = table();
    const hellkite = toHand(game, "Blast-Furnace Hellkite"); // {7}{R}{R}
    const legionnaire = spawn(game, "Porcelain Legionnaire"); // {2}{W/P}: {4}{R}{R} left.
    lands(game, "Swamp", 6);
    expect(victims(game, hellkite)).toEqual([]); // Six mana, but no red.
    lands(game, "Mountain", 1);
    expect(victims(game, hellkite)).toEqual([]); // Still one red short.
    lands(game, "Mountain", 1);
    expect(victims(game, hellkite)).toEqual([legionnaire]);
  });

  it("generic mana past the spell's generic is lost: the colours stay (rule 118.7a)", () => {
    const { game } = table();
    const hellkite = toHand(game, "Blast-Furnace Hellkite");
    const colossus = spawn(game, "Blightsteel Colossus"); // {12}: {R}{R} left.
    lands(game, "Swamp", 5);
    expect(victims(game, hellkite)).toEqual([]);
    lands(game, "Mountain", 2);
    expect(victims(game, hellkite)).toEqual([colossus]);
    cast(game, hellkite, { kicked: true, sacrifice: colossus });
    expect(zone(game, hellkite)).toBe("battlefield");
  });

  it("no mana cost reduces nothing: a token, still sacrificed", () => {
    const { game } = table();
    const hellkite = toHand(game, "Blast-Furnace Hellkite");
    const food = game.debugSpawn("Food Token", A, "battlefield");
    lands(game, "Mountain", 8);
    expect(victims(game, hellkite)).toEqual([]);
    lands(game, "Mountain", 1);
    expect(offeringOffers(game, hellkite).map((a) => a.kickerCost)).toEqual(["sacrificing Food Token"]);
    cast(game, hellkite, { kicked: true, sacrifice: food });
    expect(zone(game, hellkite)).toBe("battlefield");
    expect(game.state.objects[food]?.zone === "battlefield").toBe(false);
  });

  it("reads a mana cost's symbols: hybrid halves, Phyrexian, colorless, snow and {X}", () => {
    // {R/G} against {4}{R}{R}: whatever pays the {G} half's cost pays the {R} half's.
    expect(reductionText("{R/G}", "{4}{R}{R}")).toEqual(["{R}"]);
    // Neither half matching: one mana off the generic, whichever.
    expect(reductionText("{W/U}", "{4}{R}{R}")).toEqual(["{W}"]);
    // Twobrid against a pip of the spell's is a real choice (rule 118.7e).
    expect(reductionText("{2/R}", "{7}{R}{R}")).toEqual(["{2}", "{R}"]);
    // Twobrid with no pip to take: the {2} takes more.
    expect(reductionText("{2/W}", "{7}{R}{R}")).toEqual(["{2}"]);
    expect(reductionText("{R/P}", "{4}{R}{R}")).toEqual(["{R}"]); // 118.7f
    expect(reductionText("{S}{S}", "{4}{R}{R}")).toEqual(["{2}"]); // 118.7g
    expect(reductionText("{X}{R}", "{4}{R}{R}")).toEqual(["{R}"]); // 202.3e
    expect(reductionText("{C}", "{4}{R}{R}")).toEqual(["{C}"]); // 118.7d
    expect(reductionText(null, "{4}{R}{R}")).toEqual([""]);
  });

  it("an increase counts first (rule 601.2f): Feroz's Ban's {2}", () => {
    const { game } = table();
    spawn(game, "Feroz's Ban"); // Creature spells cost {2} more.
    const goblin = spawn(game, "Goblin Piker");
    const patron = toHand(game, "Patron of the Akki");
    lands(game, "Mountain", 5);
    expect(victims(game, patron)).toEqual([]);
    lands(game, "Mountain", 1);
    expect(victims(game, patron)).toEqual([goblin]);
  });

  it("goes with an alternative cost: Omniscience's {0} at an instant's timing (rule 118.9d)", () => {
    const { game } = table({ step: "upkeep" });
    spawn(game, "Omniscience");
    const goblin = spawn(game, "Goblin Piker");
    const patron = toHand(game, "Patron of the Akki");
    const ways = offers(game, patron);
    expect(ways).toHaveLength(1);
    expect(ways[0]).toMatchObject({ kicked: true, altCost: true });
    cast(game, patron, { kicked: true, altCost: true, sacrifice: goblin });
    expect(zone(game, patron)).toBe("battlefield");
    expect(zone(game, goblin)).toBe("graveyard");
  });
});

describe("offering's timing and choice", () => {
  it("at an instant's timing, only the cast that sacrifices", () => {
    const { game } = table({ step: "upkeep" });
    const patron = toHand(game, "Patron of the Akki");
    const goblin = spawn(game, "Goblin Piker");
    lands(game, "Mountain", 6);
    const ways = offers(game, patron);
    expect(ways).toHaveLength(1);
    expect(ways[0]).toMatchObject({
      kicked: true,
      kickerKeyword: "offering",
      kickerCost: "sacrificing Goblin Piker: -{1}{R}",
      sacrifice: { choices: [goblin] },
      emergeSacrifice: { object: goblin, cardName: "Goblin Piker", manaValue: 2 },
    });
    expect(game.canDispatch({ type: "cast-spell", player: A, card: patron, targets: [] })).not.toBeNull();
    cast(game, patron, { kicked: true, sacrifice: goblin });
    expect(zone(game, patron)).toBe("battlefield");
    expect(graveyard(game)).toContain(goblin);
  });

  it("is a choice at a sorcery's timing: the plain cast sacrifices nothing", () => {
    const { game } = table();
    const patron = toHand(game, "Patron of the Akki");
    const goblin = spawn(game, "Goblin Piker");
    lands(game, "Mountain", 6);
    expect(offers(game, patron)).toHaveLength(2);
    cast(game, patron);
    expect(zone(game, patron)).toBe("battlefield");
    expect(zone(game, goblin)).toBe("battlefield");
  });

  it("an opponent's turn is an instant's timing", () => {
    const { game } = table();
    const patron = toHand(game, "Patron of the Akki");
    const goblin = spawn(game, "Goblin Piker");
    lands(game, "Mountain", 4);
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "upkeep" && s.priority.holder === A);
    expect(victims(game, patron)).toEqual([goblin]);
    cast(game, patron, { kicked: true, sacrifice: goblin });
    expect(zone(game, patron)).toBe("battlefield");
  });

  it("offers each permanent of the quality its controller controls, and no other", () => {
    const { game } = table();
    const patron = toHand(game, "Patron of the Akki");
    const first = spawn(game, "Goblin Piker");
    const second = spawn(game, "Goblin Piker");
    spawn(game, "Grizzly Bears");
    spawn(game, "Goblin Piker", B);
    lands(game, "Mountain", 6);
    expect(victims(game, patron)).toEqual([first, second]);
  });

  it("refuses a permanent not of the quality, and a cast naming none", () => {
    const { game } = table();
    const patron = toHand(game, "Patron of the Akki");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 6);
    expect(refusal(game, patron, bears)).not.toBeNull();
    expect(refusal(game, patron)).not.toBeNull();
  });

  it("offers each twobrid half as its own way, by `costOption` (rule 118.7e)", () => {
    const { game } = table();
    const hellkite = toHand(game, "Blast-Furnace Hellkite"); // {7}{R}{R}
    const reaper = spawn(game, "The Reaper, King No More"); // {2/B}{2/R}{2/G}
    lands(game, "Swamp", 3);
    lands(game, "Mountain", 1);
    // {6} leaves {1}{R}{R}, too red for one Mountain; {4}{R} leaves {3}{R}.
    const ways = offeringOffers(game, hellkite);
    expect(ways.map((a) => a.kickerCost)).toEqual(["sacrificing The Reaper, King No More: -{4}{R}"]);
    expect(ways[0].costOption).toBe(1);
    expect(refusal(game, hellkite, reaper)).not.toBeNull(); // The first way, {6}, is short of red.
    cast(game, hellkite, { kicked: true, sacrifice: reaper, costOption: 1 });
    expect(zone(game, hellkite)).toBe("battlefield");
    expect(graveyard(game)).toContain(reaper);
  });

  it("the sacrificed permanent can pay for mana first (rule 601.2g)", () => {
    const { game } = table({ step: "upkeep" });
    const hellkite = toHand(game, "Blast-Furnace Hellkite");
    const ring = spawn(game, "Sol Ring"); // {1}, for {C}{C}: {6}{R}{R} left.
    lands(game, "Mountain", 6);
    expect(victims(game, hellkite)).toEqual([ring]);
    cast(game, hellkite, { kicked: true, sacrifice: ring });
    expect(zone(game, hellkite)).toBe("battlefield");
    expect(zone(game, ring)).toBe("graveyard");
  });
});

describe("the proving cards' other lines", () => {
  it("Patron of the Akki's attack pumps power alone, of creatures its controller controls", () => {
    const { game, a } = table();
    const patron = spawn(game, "Patron of the Akki");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    a.declareAttackersFn = () => [{ attacker: patron, defender: B }];
    toStep(game, "declare-blockers");
    expect(pt(game, patron)).toEqual({ power: 7, toughness: 5 });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });

  it("Patron of the Kitsune may gain 1 life for each creature attacking, not only its controller's", () => {
    const { game, a, b } = table();
    spawn(game, "Patron of the Kitsune");
    const theirs = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "precombat-main");
    attack(game, b, [theirs], A);
    expect(life(game, A)).toBe(21 - 2);
  });

  it("Patron of the Kitsune's gain is a choice", () => {
    const { game, a } = table();
    const own = spawn(game, "Patron of the Kitsune");
    pickModes(a);
    attack(game, a, [own], B);
    expect(life(game, A)).toBe(20);
  });

  it("Blast-Furnace Hellkite's flying and double strike", () => {
    const { game, a } = table();
    const hellkite = spawn(game, "Blast-Furnace Hellkite");
    expect(keywords(game, hellkite).has("flying")).toBe(true);
    attack(game, a, [hellkite], B);
    expect(life(game, B)).toBe(10);
  });

  it("gives double strike to a creature attacking one of its controller's opponents, whoever controls it", () => {
    const { game, a } = table({ players: 3 });
    spawn(game, "Blast-Furnace Hellkite", B);
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears], C);
    expect(life(game, C)).toBe(16); // Alice's Bears at carol, bob's opponent.
  });

  it("not to a creature attacking the Hellkite's controller", () => {
    const { game, a } = table();
    spawn(game, "Blast-Furnace Hellkite", B);
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears], B);
    expect(life(game, B)).toBe(20 - 2);
  });
});
