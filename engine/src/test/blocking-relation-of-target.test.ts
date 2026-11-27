import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, cast, keywords, lands, quiet, ref, settle, spawn, table, toHand, zone } from "./harness.js";

// A blocking relation keyed to a target or a found object (`blockingRelation.of`
// a slot): Trial's "all creatures blocking or blocked by target creature",
// Tidal Flats' "creatures you control blocking that creature" for each
// attacker a payment was declined for. Read as the effect applies (rule
// 608.2h).

/** Alice attacks with `attackers`; bob blocks as `blocks` says; on until
 * `holder` has priority in the declare blockers step. */
const combat = (
  game: Game,
  seats: { a: { declareAttackersFn: unknown }; b: { declareBlockersFn: unknown } },
  attackers: readonly ObjectId[],
  blocks: readonly { blocker: ObjectId; attacker: ObjectId }[],
  holder = A,
): void => {
  seats.a.declareAttackersFn = () => attackers.map((attacker) => ({ attacker, defender: B }));
  seats.b.declareBlockersFn = () => blocks;
  game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === holder && s.awaiting === null);
};

describe("Trial: return all creatures blocking or blocked by target creature", () => {
  it("targeting an attacker, returns each creature blocking it, and nothing else", () => {
    const { game, a, b } = table();
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    const giant = spawn(game, "Hill Giant", A);
    const other = spawn(game, "Grizzly Bears", A);
    const bears = spawn(game, "Grizzly Bears", B);
    const wall = spawn(game, "Wall of Wood", B);
    const elsewhere = spawn(game, "Hill Giant", B);
    combat(game, { a, b }, [giant, other], [
      { blocker: bears, attacker: giant },
      { blocker: wall, attacker: giant },
      { blocker: elsewhere, attacker: other },
    ]);
    cast(game, toHand(game, "Trial // Error"), { face: 1, targets: [ref(giant)] });
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, wall)).toBe("hand");
    expect(zone(game, giant)).toBe("battlefield");
    expect(zone(game, other)).toBe("battlefield");
    expect(zone(game, elsewhere)).toBe("battlefield");
  });

  it("targeting a blocker, returns the creature it blocks, not its fellow blocker", () => {
    const { game, a, b } = table();
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    const giant = spawn(game, "Hill Giant", A);
    const bears = spawn(game, "Grizzly Bears", B);
    const wall = spawn(game, "Wall of Wood", B);
    combat(game, { a, b }, [giant], [
      { blocker: bears, attacker: giant },
      { blocker: wall, attacker: giant },
    ]);
    cast(game, toHand(game, "Trial // Error"), { face: 1, targets: [ref(bears)] });
    expect(zone(game, giant)).toBe("hand");
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, wall)).toBe("battlefield");
  });
});

describe("Error: counter target multicolored spell", () => {
  it("counters a multicolored spell and can't target a monocolored one", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    expect(() => cast(game, toHand(game, "Trial // Error"), { face: 2, targets: [ref(bolt)], settle: false })).toThrow(/target/i);
    settle(game);
    const helix = toHand(game, "Lightning Helix");
    cast(game, helix, { targets: [ref(B)], settle: false });
    cast(game, toHand(game, "Trial // Error"), { face: 2, targets: [ref(helix)] });
    expect(zone(game, helix)).toBe("graveyard");
    expect(game.state.players[B].life).toBe(17);
  });
});

describe("Tidal Flats: for each attacker without flying, pay {1} or its blockers gain first strike", () => {
  it("asks for each attacker without flying, and gives first strike to your creatures blocking the unpaid ones", () => {
    const { game, a, b } = table();
    lands(game, "Mountain", 2);
    lands(game, "Island", 2, B);
    const flats = spawn(game, "Tidal Flats", B);
    const giant = spawn(game, "Hill Giant", A);
    const bears = spawn(game, "Grizzly Bears", A);
    const drake = spawn(game, "Wind Drake", A);
    const onGiant = spawn(game, "Grizzly Bears", B);
    const onBears = spawn(game, "Hill Giant", B);
    const onDrake = spawn(game, "Wind Drake", B);
    combat(
      game,
      { a, b },
      [giant, bears, drake],
      [
        { blocker: onGiant, attacker: giant },
        { blocker: onBears, attacker: bears },
        { blocker: onDrake, attacker: drake },
      ],
      B,
    );
    activate(game, flats, 0, { player: B, settle: false });
    const asked: ObjectId[] = [];
    for (;;) {
      game.advanceUntil((s) => s.awaiting !== null || quiet(s));
      const awaiting = game.state.awaiting;
      if (awaiting === null) break;
      const offer = game.legalActions(awaiting.player).find((o) => o.kind === "choose-modes");
      if (offer?.kind !== "choose-modes" || offer.aboutObject === undefined) throw new Error(`asked ${awaiting.kind}`);
      expect(awaiting.player).toBe(A);
      asked.push(offer.aboutObject);
      // Alice pays for the Giant, not for the Bears.
      game.dispatch({ type: "choose-modes", player: A, modes: offer.aboutObject === giant ? [0] : [] });
    }
    expect([...asked].sort()).toEqual([giant, bears].sort());
    expect(keywords(game, onBears).has("first-strike")).toBe(true);
    expect(keywords(game, onGiant).has("first-strike")).toBe(false);
    expect(keywords(game, onDrake).has("first-strike")).toBe(false);
    expect(keywords(game, bears).has("first-strike")).toBe(false);
  });
});
