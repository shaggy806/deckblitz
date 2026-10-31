/**
 * Choices another player makes as a spell is cast or an ability activated:
 * "target creature **of an opponent's choice** they control" (Evangelize,
 * Volcanic Offering, Magus of the Arena — `opponentChoosesTargets`, rule
 * 601.2c) and "**an opponent chooses** one —" (Library of Lat-Nam,
 * Misfortune — `castModal.chosenBy`, rule 700.2e). The caster names the
 * opponent (the cast's `otherChooser`, a variant per opponent); that
 * opponent answers the existing `choose-targets` (with `targetsFor` the
 * caster) or `choose-modes`, and the cast goes on.
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import { Game } from "../game.js";
import {
  A,
  B,
  C,
  activate,
  cast,
  counters,
  controller,
  grant,
  hand,
  lands,
  life,
  nextTurn,
  pickFromZone,
  pickTargets,
  ref,
  spawn,
  table,
  toHand,
  toLibrary,
  watchTargets,
  zone,
} from "./harness.js";

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;

describe("an opponent chooses targets as a spell is cast", () => {
  it("Evangelize: one variant per opponent, none for the caster to target, and the named opponent picks one of their own", () => {
    const { game, b } = table({ players: 3 });
    lands(game, "Plains", 5);
    const card = toHand(game, "Evangelize");
    const bobs = spawn(game, "Grizzly Bears", B);
    const carols = spawn(game, "Hill Giant", C);
    spawn(game, "Grizzly Bears", A);
    const offers = game
      .legalActions(A)
      .filter((o): o is CastOffer => o.kind === "cast-spell" && o.card === card && o.kicked !== true);
    expect(offers.map((o) => o.otherChooser).sort()).toEqual([B, C]);
    expect(offers.every((o) => o.targetSpecs.length === 0)).toBe(true);
    // Naming nobody isn't a cast.
    expect(game.canDispatch({ type: "cast-spell", player: A, card, targets: [ref(bobs)] })).not.toBeNull();
    const seen = watchTargets(b, () => [bobs]);
    cast(game, card, { otherChooser: B });
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toEqual([bobs]);
    expect(controller(game, bobs)).toBe(A);
    expect(controller(game, carols)).toBe(C);
  });

  it("Evangelize: the targets are still the caster's — a hexproof creature of theirs can't be picked", () => {
    const { game, b } = table();
    lands(game, "Plains", 5);
    const shrouded = spawn(game, "Grizzly Bears", B);
    grant(game, shrouded, "hexproof");
    const open = spawn(game, "Hill Giant", B);
    const seen = watchTargets(b, () => [open]);
    cast(game, toHand(game, "Evangelize"), { otherChooser: B });
    expect(seen.offered[0]).toEqual([open]);
    expect(controller(game, open)).toBe(A);
  });

  it("Evangelize: no variant names an opponent with nothing to choose", () => {
    const { game } = table({ players: 3 });
    lands(game, "Plains", 5);
    const card = toHand(game, "Evangelize");
    spawn(game, "Grizzly Bears", C);
    const named = game
      .legalActions(A)
      .flatMap((o) => (o.kind === "cast-spell" && o.card === card ? [o.otherChooser] : []));
    expect(named.length).toBeGreaterThan(0);
    expect(named.every((p) => p === C)).toBe(true);
    expect(game.canDispatch({ type: "cast-spell", player: A, card, targets: [], otherChooser: B })).not.toBeNull();
  });

  it("Volcanic Offering: the caster's two targets, then the opponent's two from anything the caster doesn't control", () => {
    const { game, b } = table({ players: 3 });
    lands(game, "Mountain", 5);
    const bobLand = spawn(game, "Tropical Island", B);
    const carolLand = spawn(game, "Volcanic Island", C);
    spawn(game, "Badlands", A);
    const bobGiant = spawn(game, "Hill Giant", B);
    const carolBears = spawn(game, "Grizzly Bears", C);
    spawn(game, "Grizzly Bears", A);
    const seen = watchTargets(b, () => [carolLand, carolBears]);
    cast(game, toHand(game, "Volcanic Offering"), { targets: [ref(bobLand), ref(bobGiant)], otherChooser: B });
    expect(seen.offered[0]).toEqual(expect.arrayContaining([bobLand, carolLand]));
    expect(seen.offered[0]).toHaveLength(2);
    expect(seen.offered[1]).toEqual(expect.arrayContaining([bobGiant, carolBears]));
    expect(seen.offered[1]).toHaveLength(2);
    expect([zone(game, bobLand), zone(game, carolLand), zone(game, bobGiant), zone(game, carolBears)]).toEqual([
      "graveyard",
      "graveyard",
      "graveyard",
      "graveyard",
    ]);
  });
});

describe("an opponent chooses targets as an ability is activated", () => {
  it("Magus of the Arena: the named opponent picks their creature, then the two fight", () => {
    const { game, b } = table();
    lands(game, "Mountain", 3);
    const magus = spawn(game, "Magus of the Arena", A);
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Hill Giant", B);
    const offer = game
      .legalActions(A)
      .find((o) => o.kind === "activate-ability" && o.source === magus && o.manaAbility !== true);
    expect(offer?.kind === "activate-ability" && offer.otherChooser).toBe(B);
    expect(offer?.kind === "activate-ability" && offer.targetSpecs.length).toBe(1);
    pickTargets(b, bears);
    game.dispatch({ type: "activate-ability", player: A, source: magus, abilityIndex: 0, targets: [ref(magus)], otherChooser: B });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[magus].tapped).toBe(true);
  });

  it("Magus of the Arena: activating without naming the opponent is refused", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const magus = spawn(game, "Magus of the Arena", A);
    const bears = spawn(game, "Grizzly Bears", B);
    expect(() => activate(game, magus, 0, { targets: [ref(magus), ref(bears)] })).toThrow();
  });
});

describe("an opponent chooses the mode as a spell is cast", () => {
  it("Library of Lat-Nam: the opponent picks the search, and the caster searches", () => {
    const { game, a, b } = table();
    lands(game, "Island", 5);
    const wanted = toLibrary(game, "Hill Giant", A);
    let texts: readonly string[] = [];
    b.chooseModesFn = (_view, _min, _max, modeTexts) => {
      texts = modeTexts;
      return [1];
    };
    pickFromZone(a, wanted);
    cast(game, toHand(game, "Library of Lat-Nam"), { otherChooser: B });
    expect(texts).toHaveLength(2);
    expect(hand(game, A)).toContain(wanted);
  });

  it("Library of Lat-Nam: the draw waits for the next turn's upkeep", () => {
    const { game, b } = table();
    lands(game, "Island", 5);
    b.chooseModesFn = () => [0];
    cast(game, toHand(game, "Library of Lat-Nam"), { otherChooser: B });
    const before = hand(game, A).length;
    nextTurn(game);
    expect(hand(game, A).length).toBe(before + 3);
  });

  it("Misfortune: the opponent who chose the second mode is 'that player'", () => {
    const { game, b } = table({ players: 3 });
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    lands(game, "Forest", 2);
    const bobs = spawn(game, "Hill Giant", B);
    const carols = spawn(game, "Hill Giant", C);
    const mine = spawn(game, "Grizzly Bears", A);
    b.chooseModesFn = () => [1];
    cast(game, toHand(game, "Misfortune"), { otherChooser: B });
    expect(counters(game, bobs, "-1/-1")).toBe(1);
    expect(counters(game, carols, "-1/-1")).toBe(0);
    expect(counters(game, mine, "+1/+1")).toBe(0);
    expect(life(game, B)).toBe(16);
    expect(life(game, C)).toBe(20);
  });

  it("Misfortune cast by cascade: the opponent chooses while the cascade waits, then it's cast via cascade", () => {
    const hand = ["Bituminous Blast", ...Array<string>(6).fill("Mountain")];
    const game = Game.create({
      seed: 1,
      shuffle: false,
      rules: { maxLandsPerTurn: 99, skipFirstDraw: false },
      decks: [
        { player: A, cards: [...hand, "Mountain", "Misfortune", ...Array<string>(40).fill("Mountain")] },
        { player: B, cards: Array<string>(40).fill("Forest") },
      ],
    });
    game.advanceUntil((s) => s.turn.step === "precombat-main");
    for (const name of ["Swamp", "Mountain", "Mountain", "Mountain", "Mountain"]) game.debugSpawn(name, A, "battlefield");
    const victim = game.debugSpawn("Hill Giant", B, "battlefield");
    const blast = game.handOf(A).find((id) => game.state.objects[id].cardName === "Bituminous Blast");
    if (blast === undefined) throw new Error("no Bituminous Blast");
    game.dispatch({ type: "cast-spell", player: A, card: blast, targets: [ref(victim)] });
    game.advanceUntil((s) => s.awaiting?.kind === "cast-now" || (s.zones.shared.stack.length === 0 && s.awaiting === null));
    const awaiting = game.state.awaiting;
    if (awaiting?.kind !== "cast-now") throw new Error("cascade didn't ask");
    const misfortune = awaiting.cards[0];
    expect(awaiting.offers.find((o) => o.card === misfortune)?.otherChooser).toBe(B);
    game.dispatch({
      type: "cast-now",
      player: A,
      cast: { type: "cast-spell", player: A, card: misfortune, targets: [], via: "effect", free: true, otherChooser: B },
    });
    expect(game.state.awaiting?.kind === "choose-modes" && game.state.awaiting.player).toBe(B);
    game.dispatch({ type: "choose-modes", player: B, modes: [0] });
    expect(game.state.objects[misfortune].zone).toBe("stack");
    expect(game.state.objects[misfortune].castVia).toBe("cascade");
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(life(game, A)).toBe(24);
    expect(zone(game, victim)).toBe("graveyard");
  });

  it("Misfortune: the first mode helps the caster", () => {
    const { game, b } = table();
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    lands(game, "Forest", 2);
    const mine = spawn(game, "Grizzly Bears", A);
    b.chooseModesFn = () => [0];
    cast(game, toHand(game, "Misfortune"), { otherChooser: B });
    expect(counters(game, mine, "+1/+1")).toBe(1);
    expect(life(game, A)).toBe(24);
  });
});
