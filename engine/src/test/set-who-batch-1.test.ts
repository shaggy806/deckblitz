/**
 * Doctor Who (WHO) set batch 1 — the time-counter cards: time travel,
 * vanishing, and cards that gain suspend. The mechanics themselves are in
 * `time-travel.test.ts`; these pin each card's own clause.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  cast,
  counters,
  enter,
  hand,
  lands,
  life,
  pickFromZone,
  pickTargets,
  pt,
  quiet,
  settle,
  spawn,
  table,
  toHand,
  toExile,
  toGraveyard,
  ref,
  controller,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const suspended = (game: Game, id: ObjectId): boolean =>
  game.state.objects[id].zone === "exile" &&
  game.state.objects[id].suspended === true &&
  (game.state.objects[id].counters.time ?? 0) > 0;

/** Suspend Rift Bolt (suspend 1 — {R}) from `player`'s hand. */
function suspendRiftBolt(game: Game, player: PlayerId = A): ObjectId {
  spawn(game, "Mountain", player);
  const bolt = toHand(game, "Rift Bolt", player);
  game.dispatch({ type: "suspend", player, card: bolt });
  game.advanceUntil(quiet);
  return bolt;
}

describe("Doctor Who batch 1", () => {
  it("The Eleventh Doctor: combat damage exiles a chosen hand card with its mana value in time counters, suspended", () => {
    const { game, a } = table();
    const doctor = spawn(game, "The Eleventh Doctor");
    const giant = toHand(game, "Hill Giant");
    pickFromZone(a, giant);
    a.declareAttackersFn = () => [{ attacker: doctor, defender: B }];
    toStep(game, "postcombat-main");
    settle(game);
    expect(counters(game, giant, "time")).toBe(4);
    expect(suspended(game, giant)).toBe(true);
  });

  it("The Eleventh Doctor: a mana-value-0 card is exiled with no time counter — not suspended", () => {
    const { game, a } = table();
    const doctor = spawn(game, "The Eleventh Doctor");
    const land = toHand(game, "Plains");
    pickFromZone(a, land);
    a.declareAttackersFn = () => [{ attacker: doctor, defender: B }];
    toStep(game, "postcombat-main");
    settle(game);
    expect(zone(game, land)).toBe("exile");
    expect(suspended(game, land)).toBe(false);
  });

  it("Sibylline Soothsayer: only the nonland card of mana value 3+ is exiled, with three time counters, suspended", () => {
    const { game } = table();
    const giant = toLibrary(game, "Hill Giant");
    const bears = toLibrary(game, "Grizzly Bears");
    const plains = toLibrary(game, "Plains");
    enter(game, "Sibylline Soothsayer");
    expect(counters(game, giant, "time")).toBe(3);
    expect(suspended(game, giant)).toBe(true);
    // Revealed, not exiled: the rest go to the bottom of the library.
    expect(zone(game, bears)).toBe("library");
    expect(zone(game, plains)).toBe("library");
    const library = game.state.zones.perPlayer[A].library;
    expect(library.slice(-2).sort()).toEqual([bears, plains].sort());
  });

  it("a modal double-faced card that gained suspend may be played as its land face when its last counter comes off (rule 702.62a: 'play')", () => {
    const { game, a } = table();
    const mammoth = toLibrary(game, "Kazandu Mammoth");
    enter(game, "Sibylline Soothsayer");
    expect(suspended(game, mammoth)).toBe(true);
    game.state.objects[mammoth].counters.time = 1;
    let landOffered = false;
    a.chooseCastNowFn = (_v, offer) => {
      const land = offer.lands?.find((l) => l.card === mammoth);
      landOffered = land !== undefined;
      return land === undefined ? null : { type: "play-land", player: A, card: mammoth, ...(land.face !== undefined ? { face: land.face } : {}) };
    };
    toStep(game, "upkeep");
    settle(game);
    expect(landOffered).toBe(true);
    expect(zone(game, mammoth)).toBe("battlefield");
  });

  it("Rory Williams: cast from the hand, it's exiled with three time counters, suspended, and you investigate; cast from exile, it resolves", () => {
    const { game, a } = table();
    lands(game, "Tundra", 2);
    const rory = toHand(game, "Rory Williams");
    cast(game, rory);
    expect(counters(game, rory, "time")).toBe(3);
    expect(suspended(game, rory)).toBe(true);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    a.chooseCastNowFn = (_v, offer) =>
      offer.casts.length === 0 ? null : { type: "cast-spell", player: A, card: offer.cards[0], targets: [], via: "effect", free: true };
    for (let i = 0; i < 3; i += 1) {
      toStep(game, "upkeep");
      settle(game);
    }
    expect(zone(game, rory)).toBe("battlefield");
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
  });

  it("Crack in Time: exiles one creature as it enters and another at your first main phase; both return as it's sacrificed", () => {
    const { game, a } = table();
    const first = spawn(game, "Grizzly Bears", B);
    const second = spawn(game, "Hill Giant", B);
    pickTargets(a, first);
    const crack = enter(game, "Crack in Time");
    expect(zone(game, first)).toBe("exile");
    // Alice's next first main phase (turn 3 — bob's turn comes between).
    pickTargets(a, second);
    toStep(game, "precombat-main");
    settle(game);
    expect(zone(game, second)).toBe("exile");
    game.state.objects[crack].counters.time = 1;
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, crack)).toBe("graveyard");
    expect(zone(game, first)).toBe("battlefield");
    expect(zone(game, second)).toBe("battlefield");
  });

  it("Regenerations Restored: each removal scries 1 and gains 1 life; the last, its trigger resolving first, exiles it for an extra turn", () => {
    const { game, a } = table();
    game.setOrdersOwnTriggers(A, true);
    const restored = enter(game, "Regenerations Restored");
    expect(counters(game, restored, "time")).toBe(12);
    const before = life(game, A);
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, restored, "time")).toBe(11);
    expect(life(game, A)).toBe(before + 1);
    game.state.objects[restored].counters.time = 1;
    // Its own trigger first (resolving first), vanishing's sacrifice after.
    a.orderTriggersFn = (_v, triggers) => {
      const mine = triggers.findIndex((t) => t.text.startsWith("Whenever one or more time counters"));
      return [mine, ...triggers.map((_, i) => i).filter((i) => i !== mine)];
    };
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, restored)).toBe("exile");
    expect(game.state.extraTurns).toContain(A);
  });

  it("Kate Stewart: putting time counters on your permanent makes a Soldier", () => {
    const { game, a } = table();
    const knocks = enter(game, "Four Knocks");
    spawn(game, "Kate Stewart");
    const soldiers = tokensNamed(game, "Soldier Token", A);
    a.chooseTimeTravelFn = () => ({ add: [knocks], remove: [] });
    lands(game, "Island", 2);
    cast(game, toHand(game, "Wibbly-wobbly, Timey-wimey"));
    expect(tokensNamed(game, "Soldier Token", A)).toBe(soldiers + 1);
  });

  it("Rose Tyler: attacking, a time counter for each suspended card you own and each other permanent with one; +1/+1 each", () => {
    const { game, a } = table();
    const rose = spawn(game, "Rose Tyler");
    enter(game, "Four Knocks");
    suspendRiftBolt(game);
    // Bob's suspended card and permanent don't count.
    enter(game, "Four Knocks", B);
    const bobs = toExile(game, "Rift Bolt", B);
    game.state.objects[bobs].suspended = true;
    game.state.objects[bobs].counters.time = 2;
    a.declareAttackersFn = () => [{ attacker: rose, defender: B }];
    toStep(game, "declare-blockers");
    settle(game);
    expect(counters(game, rose, "time")).toBe(2);
    expect(pt(game, rose)).toEqual({ power: 4, toughness: 4 });
  });

  it("Ecstatic Beauty: of the three exiled, only a card with suspend gets four time counters", () => {
    const { game } = table();
    const bolt = toLibrary(game, "Rift Bolt");
    const bears = toLibrary(game, "Grizzly Bears");
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Ecstatic Beauty"));
    expect(counters(game, bolt, "time")).toBe(4);
    expect(suspended(game, bolt)).toBe(true);
    expect(zone(game, bears)).toBe("exile");
    expect(suspended(game, bears)).toBe(false);
  });

  it("The Parting of the Ways I: each nonland card exiled gets its mana value in time counters and suspend; a land doesn't", () => {
    const { game } = table();
    const giant = toLibrary(game, "Hill Giant");
    const plains = toLibrary(game, "Plains");
    lands(game, "Mountain", 6);
    cast(game, toHand(game, "The Parting of the Ways"));
    expect(counters(game, giant, "time")).toBe(4);
    expect(suspended(game, giant)).toBe(true);
    expect(zone(game, plains)).toBe("exile");
    expect(suspended(game, plains)).toBe(false);
  });

  it("All of History, All at Once: storm copies time travel too", () => {
    const { game, a } = table();
    const knocks = enter(game, "Four Knocks");
    a.chooseTimeTravelFn = () => ({ add: [knocks], remove: [] });
    lands(game, "Island", 6);
    cast(game, toHand(game, "Opt"), { settle: true });
    cast(game, toHand(game, "All of History, All at Once"));
    expect(counters(game, knocks, "time")).toBe(6);
  });

  it("Jenny, Generated Anomaly: double strike — it explores in each combat damage step it hits a player in", () => {
    const { game, a } = table();
    const jenny = spawn(game, "Jenny, Generated Anomaly");
    toLibrary(game, "Plains");
    toLibrary(game, "Plains");
    const before = hand(game).length;
    a.declareAttackersFn = () => [{ attacker: jenny, defender: B }];
    toStep(game, "postcombat-main");
    settle(game);
    expect(hand(game).length).toBe(before + 2);
  });

  describe("older cards that waited on time counters", () => {
    it("Deep Forest Hermit: vanishing 3, four Squirrels, Squirrels +1/+1", () => {
      const { game } = table();
      const hermit = enter(game, "Deep Forest Hermit");
      expect(counters(game, hermit, "time")).toBe(3);
      expect(tokensNamed(game, "Squirrel Token", A)).toBe(4);
      const squirrel = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Squirrel Token");
      expect(pt(game, squirrel as ObjectId)).toEqual({ power: 2, toughness: 2 });
    });

    it("Dreamtide Whale: a player's second spell each turn proliferates", () => {
      const { game, a } = table();
      const whale = enter(game, "Dreamtide Whale");
      a.chooseProliferateFn = (_v, eligible) => eligible;
      lands(game, "Island", 2);
      cast(game, toHand(game, "Opt"));
      expect(counters(game, whale, "time")).toBe(2);
      cast(game, toHand(game, "Opt"));
      expect(counters(game, whale, "time")).toBe(3);
    });

    it("Kang Prime: the lands exiled before it stay exiled; the nonland card gets two time counters, suspended", () => {
      const { game } = table();
      const giant = toLibrary(game, "Hill Giant");
      const plains = toLibrary(game, "Plains");
      enter(game, "Kang Prime");
      expect(zone(game, plains)).toBe("exile");
      expect(suspended(game, plains)).toBe(false);
      expect(counters(game, giant, "time")).toBe(2);
      expect(suspended(game, giant)).toBe(true);
    });

    it("The Tenth Doctor: {7} time travels three times", () => {
      const { game, a } = table();
      const doctor = spawn(game, "The Tenth Doctor");
      const knocks = enter(game, "Four Knocks");
      let asked = 0;
      a.chooseTimeTravelFn = () => {
        asked += 1;
        return { add: [knocks], remove: [] };
      };
      lands(game, "Wastes", 7);
      game.dispatch({ type: "activate-ability", player: A, source: doctor, abilityIndex: 0, targets: [] });
      settle(game);
      expect(asked).toBe(3);
      expect(counters(game, knocks, "time")).toBe(7);
    });

    it("Doom's Time Platform: attacking exiles a nonland card from your graveyard with two time counters, suspended", () => {
      const { game, a } = table();
      spawn(game, "Doom's Time Platform");
      const bears = spawn(game, "Grizzly Bears");
      const giant = toGraveyard(game, "Hill Giant");
      pickTargets(a, giant);
      a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
      toStep(game, "postcombat-main");
      settle(game);
      expect(counters(game, giant, "time")).toBe(2);
      expect(suspended(game, giant)).toBe(true);
    });

    it("Suspend: the creature is exiled with two time counters and comes back, hasty, for its owner", () => {
      const { game, a, b } = table();
      const giant = spawn(game, "Hill Giant", B);
      lands(game, "Island", 1);
      cast(game, toHand(game, "Suspend"), { targets: [ref(giant)] });
      expect(counters(game, giant, "time")).toBe(2);
      expect(suspended(game, giant)).toBe(true);
      void a;
      b.chooseCastNowFn = (_v, offer) =>
        offer.casts.length === 0 ? null : { type: "cast-spell", player: B, card: offer.cards[0], targets: [], via: "effect", free: true };
      toStep(game, "upkeep", B);
      settle(game);
      expect(counters(game, giant, "time")).toBe(1);
      toStep(game, "upkeep", B);
      settle(game);
      expect(zone(game, giant)).toBe("battlefield");
      expect(controller(game, giant)).toBe(B);
    });

    it("Taigam: your second spell is copied, and the spell itself exiled with four time counters, suspended", () => {
      const { game } = table();
      spawn(game, "Taigam, Master Opportunist");
      lands(game, "Island", 2);
      cast(game, toHand(game, "Opt"));
      const before = hand(game).length;
      const second = toHand(game, "Opt");
      cast(game, second);
      // The second Opt joined the hand after `before` and left it as cast; the
      // copy drew one (Opt: scry 1, draw a card) and the original didn't resolve.
      expect(hand(game).length).toBe(before + 1);
      expect(counters(game, second, "time")).toBe(4);
      expect(suspended(game, second)).toBe(true);
    });
  });
});
