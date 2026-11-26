import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, cast, hand, lands, life, nextTurn, ref, settle, spawn, table, toGraveyard, toHand, toLibrary, zone } from "./harness.js";

/**
 * A rules audit's fifth slice (2026-11-26): two replacement or prevention
 * effects on one event (rule 616). The doublers, shields and "that many plus
 * one" counters are tested in `replacement-order*.test.ts`; these are the
 * pairs those don't reach — a control change before what reads control
 * (616.1b), a replacement made applicable by another (616.2), the affected
 * player's choice between two that each take the event away (616.1e).
 */

const named = (game: Game, name: string, player?: PlayerId): ObjectId[] =>
  game.state.zones.shared.battlefield.filter(
    (id) => game.state.objects[id].cardName === name && (player === undefined || game.state.objects[id].controller === player),
  );

describe("replacement effects together, audited", () => {
  it("Gather Specimens' control change comes first, so the new controller's Hardened Scales applies (rule 616.1b)", () => {
    const { game } = table();
    spawn(game, "Hardened Scales", A);
    nextTurn(game); // bob's turn
    game.debugApplyEffect(A, {
      kind: "replacement-effect",
      duration: "end-of-turn",
      replacement: { event: "others-enter-battlefield", filter: { type: "creature", controlledBy: "opponent" }, underYou: true },
    });
    lands(game, "Forest", 3, B);
    cast(game, toHand(game, "Spike Feeder", B), { player: B });
    const [feeder] = named(game, "Spike Feeder");
    expect(game.state.objects[feeder].controller).toBe(A);
    // Two, plus one for alice's Scales.
    expect(game.state.objects[feeder].counters["+1/+1"]).toBe(3);
  });

  it("damage Pariah redirects to its creature meets a shield on that creature (rule 616.2)", () => {
    // Bob's Pariah on his Hill Giant, a "prevent the next 1" on the Giant;
    // alice Bolts bob. 3 goes to the Giant instead, 1 of it prevented.
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    const pariah = spawn(game, "Pariah", B);
    game.debugApplyEffect(B, { kind: "attach", target: 0, attachment: 1 }, [ref(giant), ref(pariah)]);
    expect(game.state.objects[pariah].attachedTo).toBe(giant);
    game.debugApplyEffect(B, { kind: "prevent-damage", target: 0, amount: 1 }, [ref(giant)]);
    const before = life(game, B);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(before);
    expect(game.state.objects[giant].damageMarked).toBe(2);
  });

  it("Rest in Peace beside madness: the discarding player may take madness, and cast the card (rules 616.1e, 702.35a)", () => {
    const { game, a } = table();
    spawn(game, "Rest in Peace", B);
    lands(game, "Swamp", 1);
    const imp = toHand(game, "Kitchen Imp");
    a.chooseDiscardsFn = () => [imp];
    const offered: string[] = [];
    a.chooseCastNowFn = (_view, offer) => {
      offered.push(...offer.casts.map((c) => c.cardName));
      const way = offer.casts[0]!;
      return { type: "cast-spell", player: A, card: way.card, targets: [], via: way.via };
    };
    game.debugApplyEffect(A, { kind: "discard", target: "you", amount: 1 });
    settle(game);
    expect(offered).toEqual(["Kitchen Imp"]);
    expect(zone(game, imp)).toBe("battlefield");
  });

  it("Notion Thief beside dredge: the drawing player may dredge, and the Thief gets nothing (rules 616.1e, 702.52a)", () => {
    const { game, a } = table();
    spawn(game, "Notion Thief", B);
    const thug = toGraveyard(game, "Golgari Thug");
    for (let i = 0; i < 5; i++) toLibrary(game, "Wastes");
    const bobs = hand(game, B).length;
    let asked = 0;
    a.chooseModesFn = (_view, _min, _max, modes) => {
      asked += 1;
      const dredge = (modes as readonly { text?: string }[] | undefined)?.findIndex((m) => /dredge/i.test(m.text ?? "")) ?? -1;
      return [dredge >= 0 ? dredge : 1];
    };
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    expect(asked).toBeGreaterThan(0);
    expect(zone(game, thug)).toBe("hand");
    expect(hand(game, B).length).toBe(bobs);
  });

  it("Notion Thief, dredge declined: bob draws instead (control for the test above)", () => {
    const { game, a } = table();
    spawn(game, "Notion Thief", B);
    const thug = toGraveyard(game, "Golgari Thug");
    for (let i = 0; i < 5; i++) toLibrary(game, "Wastes");
    const bobs = hand(game, B).length;
    a.chooseModesFn = () => [0];
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    expect(zone(game, thug)).toBe("graveyard");
    expect(hand(game, B).length).toBe(bobs + 1);
  });

  it("a kicked Burst Lightning's own 'instead' applies before Furnace of Rath doubles it (rule 616.1a)", () => {
    const { game } = table();
    spawn(game, "Furnace of Rath", B);
    lands(game, "Mountain", 5);
    const before = life(game, B);
    cast(game, toHand(game, "Burst Lightning"), { targets: [ref(B)], kicked: true } as never);
    expect(life(game, B)).toBe(before - 8);
  });
});
