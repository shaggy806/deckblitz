/**
 * March of the Machine (MOM/MOC), batch 1, part b (2026-10-17).
 * Written on the shared table in `harness.ts`, each test from the Oracle text.
 */
import { describe, expect, it } from "vitest";

import { printedCardName } from "../state.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  hand,
  lands,
  life,
  named,
  pickModes,
  pickPermanents,
  pt,
  ref,
  settle,
  spawn,
  table,
  tokensNamed,
  toHand,
  toStep,
  types,
  zone,
} from "./harness.js";

describe("Elenda and Azor", () => {
  it("attacks: pay {X}{W}{U}{B} to draw X cards", () => {
    const { game, a } = table();
    const elenda = spawn(game, "Elenda and Azor");
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 2);
    a.declareAttackersFn = () => [{ attacker: elenda, defender: B }];
    game.advanceUntil((s) => s.awaiting?.kind === "choose-modes");
    const before = hand(game).length;
    game.dispatch({ type: "choose-modes", player: A, modes: [0], xValue: 2 });
    settle(game);
    expect(hand(game)).toHaveLength(before + 2);
  });

  it("each end step — an opponent's too: pay 4 life for a lifelinking Vampire Knight per card you drew this turn", () => {
    const { game, a } = table();
    spawn(game, "Elenda and Azor");
    // Declined at Alice's own end step on the way to Bob's turn.
    pickModes(a);
    toStep(game, "precombat-main", B);
    expect(life(game, A)).toBe(20);
    expect(tokensNamed(game, "Vampire Knight Token", A)).toBe(0);
    // Bob's turn: Alice draws two cards during it.
    pickModes(a, 0);
    game.debugApplyEffect(A, { kind: "draw", amount: 2 }, []);
    settle(game);
    toStep(game, "end", B);
    settle(game);
    expect(life(game, A)).toBe(16);
    expect(tokensNamed(game, "Vampire Knight Token", A)).toBe(2);
  });
});

describe("Locthwain Lancer", () => {
  it("triggers for itself and each nontoken Knight dying beside it, not for a Knight token", () => {
    const { game } = table();
    spawn(game, "Locthwain Lancer");
    // Another nontoken Knight of Alice's and a Knight token.
    spawn(game, "Elenda and Azor");
    game.debugApplyEffect(A, { kind: "create-token", token: "Vampire Knight Token", count: 1 }, []);
    settle(game);
    const before = hand(game).length;
    const bobBefore = life(game, B);
    game.debugApplyEffect(B, { kind: "destroy-all", filter: { type: "creature", controlledBy: "opponent" } }, []);
    settle(game);
    // Two nontoken Knights of Alice's died: two triggers.
    expect(life(game, B)).toBe(bobBefore - 2);
    expect(hand(game)).toHaveLength(before + 2);
  });
});

describe("Scorn-Blade Berserker", () => {
  it("backup grants '{1}, Sacrifice this creature: Draw a card', which sacrifices the creature that has it", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    a.chooseTargetsFn = () => [ref(bears)];
    lands(game, "Swamp", 2);
    const berserker = toHand(game, "Scorn-Blade Berserker");
    cast(game, berserker);
    expect(counters(game, bears)).toBe(1);
    const before = hand(game).length;
    activate(game, bears, 0);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, berserker)).toBe("battlefield");
    expect(hand(game)).toHaveLength(before + 1);
  });
});

describe("Elvish Vatkeeper", () => {
  it("{5}: transforms target Incubator, then doubles its +1/+1 counters", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    lands(game, "Forest", 7);
    const vatkeeper = toHand(game, "Elvish Vatkeeper");
    cast(game, vatkeeper);
    const [incubator] = named(game, "Incubator Token", A);
    expect(counters(game, incubator)).toBe(2);
    activate(game, vatkeeper, 0, { targets: [ref(incubator)] });
    expect(printedCardName(game.state.objects[incubator])).toBe("Phyrexian Token");
    expect(counters(game, incubator)).toBe(4);
    expect(pt(game, incubator)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Sunder the Gateway", () => {
  it("second mode: incubate 2, then transform an Incubator you choose — an older one is offered too", () => {
    const { game, a } = table();
    game.debugApplyEffect(A, { kind: "incubate", amount: 1 }, []);
    settle(game);
    const [older] = named(game, "Incubator Token", A);
    const seen = pickPermanents(a, older);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Sunder the Gateway"), { modes: [1] });
    const incubators = named(game, "Incubator Token", A);
    expect(incubators).toHaveLength(2);
    const fresh = incubators.find((id) => id !== older)!;
    expect([...seen.offered].sort()).toEqual([...incubators].sort());
    expect(types(game, older)).toEqual(["artifact", "creature"]);
    expect(types(game, fresh)).toEqual(["artifact"]);
    expect(counters(game, fresh)).toBe(2);
  });

  it("first mode: destroys a nontoken artifact an opponent controls, and incubates 2", () => {
    const { game } = table();
    const ring = spawn(game, "Sol Ring", B);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Sunder the Gateway"), { modes: [0], targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("graveyard");
    expect(named(game, "Incubator Token", A)).toHaveLength(1);
  });
});

describe("Change the Equation", () => {
  it("counters a green spell of mana value 6 with its second mode, which the first mode can't target", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    lands(game, "Island", 2);
    const titan = toHand(game, "Primeval Titan");
    cast(game, titan, { settle: false });
    const equation = toHand(game, "Change the Equation");
    expect(() => cast(game, equation, { modes: [0], targets: [ref(titan)], settle: false })).toThrow();
    cast(game, equation, { modes: [1], targets: [ref(titan)] });
    expect(zone(game, titan)).toBe("graveyard");
  });
});

describe("Fertilid's Favor", () => {
  it("the target player fetches a basic land tapped, and an artifact gets two +1/+1 counters", () => {
    const { game, b } = table();
    b.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    const ring = spawn(game, "Sol Ring");
    lands(game, "Forest", 4);
    const bobLands = (): number =>
      game.battlefield.filter((id) => game.state.objects[id].controller === B && game.state.objects[id].cardName === "Wastes").length;
    cast(game, toHand(game, "Fertilid's Favor"), { targets: [ref(B), ref(ring)] });
    expect(bobLands()).toBe(1);
    const [wastes] = game.battlefield.filter((id) => game.state.objects[id].controller === B);
    expect(game.state.objects[wastes].tapped).toBe(true);
    expect(counters(game, ring)).toBe(2);
  });
});

describe("Seraph of New Capenna // Seraph of New Phyrexia", () => {
  it("transforms at sorcery speed, and the back face's attack sacrifice gives +2/+1", () => {
    const { game, a } = table();
    const seraph = spawn(game, "Seraph of New Capenna");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 5);
    activate(game, seraph, 0);
    expect(printedCardName(game.state.objects[seraph])).toBe("Seraph of New Phyrexia");
    expect(pt(game, seraph)).toEqual({ power: 3, toughness: 3 });
    a.chooseModesFn = () => [0];
    a.choosePermanentsFn = () => [bears];
    attack(game, a, [seraph]);
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(15);
  });
});
