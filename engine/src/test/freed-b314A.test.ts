/**
 * Batch 314, group A: cards freed by built need keys — the clause of each most
 * likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { Action, LegalAction } from "../actions.js";
import type { ScriptedController } from "../controller.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  types,
  zone,
} from "./harness.js";

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;

/** Answers each choose-from-zone with those of `ids` it offers, else its first card. */
function pickOffered(seat: ScriptedController, ...ids: readonly ObjectId[]): void {
  seat.chooseFromZoneFn = (_view, eligible) => {
    const wanted = ids.filter((id) => eligible.includes(id));
    return wanted.length > 0 ? wanted : eligible.slice(0, 1);
  };
}


describe("Void Maw", () => {
  it("exiles another dying creature with it, and its cost puts that card into the graveyard", () => {
    const { game } = table();
    const maw = spawn(game, "Void Maw");
    const bears = spawn(game, "Grizzly Bears", B);
    destroy(game, bears);
    expect(zone(game, bears)).toBe("exile");
    activate(game, maw, 0);
    expect(zone(game, bears)).toBe("graveyard");
    expect(pt(game, maw)).toEqual({ power: 6, toughness: 7 });
    // Nothing left exiled with it: the ability can't be activated again.
    expect(game.canDispatch({ type: "activate-ability", player: A, source: maw, abilityIndex: 0, targets: [] } as Action)).not.toBeNull();
  });

  it("dies itself into the graveyard", () => {
    const { game } = table();
    const maw = spawn(game, "Void Maw");
    destroy(game, maw);
    expect(zone(game, maw)).toBe("graveyard");
  });
});

describe("Flash of Insight", () => {
  it("flashback exiles X blue cards, and looks at that many", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    const flash = toGraveyard(game, "Flash of Insight");
    const opt = toGraveyard(game, "Opt");
    const divination = toGraveyard(game, "Divination");
    const bears = toGraveyard(game, "Grizzly Bears");
    const offer = game
      .legalActions(A)
      .find((x): x is CastOffer => x.kind === "cast-spell" && x.card === flash && x.via === "flashback");
    // Only the two other blue cards can pay.
    expect(offer?.xCost?.maxX).toBe(2);
    const second = toLibrary(game, "Forest");
    const top = toLibrary(game, "Grizzly Bears");
    pickOffered(a, opt, divination, second);
    const before = hand(game).length;
    cast(game, flash, { via: "flashback", x: 2 });
    expect(zone(game, opt)).toBe("exile");
    expect(zone(game, divination)).toBe("exile");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, flash)).toBe("exile");
    expect(hand(game).length).toBe(before + 1);
    expect(zone(game, second)).toBe("hand");
    expect(zone(game, top)).toBe("library");
  });
});

describe("Diplomatic Escort", () => {
  it("counters a spell that targets a creature, but can't target one that targets a player", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    lands(game, "Island", 1);
    const escort = spawn(game, "Diplomatic Escort");
    const bears = spawn(game, "Grizzly Bears", B);
    const atPlayer = toHand(game, "Shock");
    cast(game, atPlayer, { targets: [ref(B)], settle: false });
    const refused = game.canDispatch({
      type: "activate-ability",
      player: A,
      source: escort,
      abilityIndex: 0,
      targets: [ref(atPlayer)],
    } as Action);
    expect(refused).not.toBeNull();
    settle(game);
    const atBears = toHand(game, "Shock");
    cast(game, atBears, { targets: [ref(bears)], settle: false });
    activate(game, escort, 0, { targets: [ref(atBears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, atBears)).toBe("graveyard");
  });
});

describe("Melee", () => {
  it("can't be cast in a main phase", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const melee = toHand(game, "Melee");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: melee, targets: [] } as Action)).not.toBeNull();
  });

  it("untaps an unblocked attacker and removes it from combat", () => {
    const { game, a } = table();
    lands(game, "Mountain", 5);
    const bears = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    game.advanceUntil(
      (s) => s.turn.step === "declare-attackers" && s.awaiting === null && s.priority.holder === A && s.objects[bears].tapped,
    );
    cast(game, toHand(game, "Melee"));
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(20);
    expect(game.state.objects[bears].tapped).toBe(false);
  });
});

describe("Parker Luck", () => {
  it("two target players each lose the other's revealed mana value and take their own card", () => {
    const { game, a } = table();
    spawn(game, "Parker Luck");
    const mine = toLibrary(game, "Grizzly Bears", A);
    const theirs = toLibrary(game, "Shock", B);
    pickTargets(a, A, B);
    toStep(game, "end");
    settle(game);
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(18);
    expect(zone(game, mine)).toBe("hand");
    expect(zone(game, theirs)).toBe("hand");
  });
});

describe("Abuelo's Awakening", () => {
  it("returns an artifact as a flying 1/1 Spirit creature with X +1/+1 counters", () => {
    const { game } = table();
    lands(game, "Plains", 6);
    const ring = toGraveyard(game, "Sol Ring");
    cast(game, toHand(game, "Abuelo's Awakening"), { targets: [ref(ring)], x: 2 });
    expect(zone(game, ring)).toBe("battlefield");
    expect(counters(game, ring)).toBe(2);
    expect(pt(game, ring)).toEqual({ power: 3, toughness: 3 });
    expect(types(game, ring)).toContain("creature");
    expect(keywords(game, ring).has("flying")).toBe(true);
  });
});

describe("Renegade Krasis", () => {
  it("when it evolves, each other creature you control with a +1/+1 counter gets another", () => {
    const { game } = table();
    const krasis = spawn(game, "Renegade Krasis");
    const marked = spawn(game, "Grizzly Bears");
    game.state.objects[marked].counters["+1/+1"] = 1;
    const plain = spawn(game, "Grizzly Bears");
    enter(game, "Hill Giant");
    expect(counters(game, krasis)).toBe(1);
    expect(counters(game, marked)).toBe(2);
    expect(counters(game, plain)).toBe(0);
  });
});

describe("Psychic Possession", () => {
  it("you may draw whenever the enchanted opponent draws, and you skip your draw step", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    pickModes(a, 0);
    cast(game, toHand(game, "Psychic Possession"), { targets: [ref(B)] });
    const mine = hand(game).length;
    game.debugApplyEffect(B, { kind: "draw", amount: 1 });
    settle(game);
    expect(hand(game).length).toBe(mine + 1);
    // Alice's next draw step is skipped: her hand only moves by bob's draws.
    const before = hand(game).length;
    const bobsBefore = hand(game, B).length;
    toStep(game, "precombat-main");
    toStep(game, "precombat-main");
    const bobDrew = hand(game, B).length - bobsBefore;
    expect(hand(game).length).toBe(before + bobDrew);
  });
});
