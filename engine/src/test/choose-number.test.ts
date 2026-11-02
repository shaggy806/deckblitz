/**
 * A number a player chooses, beyond Void's "choose a number" as a spell
 * resolves (`choose-value.test.ts`): as an additional cost, announced like an X
 * (Liquid Fire); by each player or a target opponent, kept for the steps after
 * it and kept secret until they're all in (a `vote` of `for: { number }` — Wheel
 * of Misfortune, Menacing Ogre, Choice of Damnations); by each player in turn
 * (`choose-value`'s `who` — Diminishing Returns); up to a bound read as it
 * resolves (`max` as an amount); kept on the permanent for its P/T, the last one
 * replacing the one before (`remember` — Shapeshifter); and of any size, with an
 * echo of your life total (Volcano Hellion).
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { EffectSpec } from "../effects.js";
import type { GameEvent } from "../events.js";
import { manaValueOfObject } from "../filter.js";
import type { ObjectId } from "../primitives.js";
import { viewFor } from "../view.js";

import {
  A,
  B,
  C,
  D,
  cast,
  enter,
  graveyard,
  hand,
  lands,
  life,
  named,
  nextTurn,
  pickModes,
  pickPermanents,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

type Table = ReturnType<typeof table>;

describe("a number chosen as an additional cost (Liquid Fire)", () => {
  const board = () => {
    const t = table();
    lands(t.game, "Mountain", 6);
    return { ...t, fire: toHand(t.game, "Liquid Fire") };
  };

  it("is offered like an X from 0 to 5, whatever mana there is, and marked as a number", () => {
    const { game, fire } = board();
    spawn(game, "Hill Giant", B);
    const offer = game
      .legalActions(A)
      .find((l): l is Extract<LegalAction, { kind: "cast-spell" }> => l.kind === "cast-spell" && l.card === fire);
    expect(offer?.xCost).toEqual({ maxX: 5, chosenNumber: true });
  });

  it("deals X to the creature and 5 minus X to its controller", () => {
    const { game, fire } = board();
    const giant = spawn(game, "Hill Giant", B);
    cast(game, fire, { targets: [ref(giant)], x: 2 });
    expect(game.state.objects[giant].damageMarked).toBe(2);
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(20);
  });

  it("at 5 its controller is dealt nothing, and at 0 the creature is dealt nothing (the ruling)", () => {
    const { game, fire } = board();
    const giant = spawn(game, "Hill Giant", B);
    cast(game, fire, { targets: [ref(giant)], x: 0 });
    expect(game.state.objects[giant].damageMarked).toBe(0);
    expect(life(game, B)).toBe(15);

    const second = board();
    const bear = spawn(second.game, "Grizzly Bears", B);
    cast(second.game, second.fire, { targets: [ref(bear)], x: 5 });
    expect(zone(second.game, bear)).toBe("graveyard");
    expect(life(second.game, B)).toBe(20);
  });

  it("refuses a number outside the range, and asks nothing as it resolves", () => {
    const { game, fire, a } = board();
    const giant = spawn(game, "Hill Giant", B);
    const action = { type: "cast-spell", player: A, card: fire, targets: [ref(giant)] } as const;
    expect(game.canDispatch({ ...action, xValue: 6 })).toMatch(/from 0 to 5/);
    let asked = false;
    a.chooseNumberFn = () => {
      asked = true;
      return 0;
    };
    cast(game, fire, { targets: [ref(giant)], x: 3 });
    expect(asked).toBe(false);
  });

  it("costs its mana alone, and its mana value doesn't count the number", () => {
    const { game, fire } = board();
    const giant = spawn(game, "Hill Giant", B);
    cast(game, fire, { targets: [ref(giant)], x: 5, settle: false });
    const onStack = game.state.objects[fire];
    expect(onStack.xValue).toBe(5);
    expect(manaValueOfObject(game.registry, onStack, onStack.xValue ?? 0)).toBe(6);
  });
});

describe("each player secretly chooses a number (Wheel of Misfortune)", () => {
  const board = (numbers: readonly [number, number, number, number]) => {
    const t = table({ players: 4 });
    lands(t.game, "Mountain", 3);
    const spell = toHand(t.game, "Wheel of Misfortune");
    t.a.chooseNumberFn = () => numbers[0];
    t.b.chooseNumberFn = () => numbers[1];
    t.c.chooseNumberFn = () => numbers[2];
    t.d.chooseNumberFn = () => numbers[3];
    return { ...t, spell };
  };

  it("damages each player with the highest, however many, and wheels all but the lowest (the ruling's 4, 7, 7, 7)", () => {
    const { game, spell } = board([4, 7, 7, 7]);
    const keeps = toHand(game, "Grizzly Bears", A);
    const lost = toHand(game, "Grizzly Bears", B);
    const kept = hand(game, A).length - 1; // less the spell
    cast(game, spell);
    expect([life(game, A), life(game, B), life(game, C), life(game, D)]).toEqual([20, 13, 13, 13]);
    expect(zone(game, keeps)).toBe("hand");
    expect(hand(game, A)).toHaveLength(kept);
    expect(zone(game, lost)).toBe("graveyard");
    expect(hand(game, B)).toHaveLength(7);
    expect(hand(game, C)).toHaveLength(7);
    expect(hand(game, D)).toHaveLength(7);
  });

  it("with one number, everyone is dealt it and nobody wheels", () => {
    const { game, spell } = board([3, 3, 3, 3]);
    const keeps = toHand(game, "Grizzly Bears", C);
    const kept = hand(game, C).length;
    cast(game, spell);
    expect([life(game, A), life(game, B), life(game, C), life(game, D)]).toEqual([17, 17, 17, 17]);
    expect(zone(game, keeps)).toBe("hand");
    expect(hand(game, C)).toHaveLength(kept);
  });

  it("the highest alone is damaged; those in between wheel without being damaged", () => {
    const { game, spell } = board([0, 2, 5, 2]);
    const kept = hand(game, A).length - 1; // less the spell
    cast(game, spell);
    expect([life(game, A), life(game, B), life(game, C), life(game, D)]).toEqual([20, 20, 15, 20]);
    expect([hand(game, A).length, hand(game, B).length, hand(game, C).length, hand(game, D).length]).toEqual([
      kept,
      7,
      7,
      7,
    ]);
  });

  it("asks in turn from the active player, and nobody sees a number until all are in", () => {
    const { game, spell, a, b, c, d } = board([0, 0, 0, 0]);
    const asked: string[] = [];
    const seen: GameEvent[][] = [];
    const answers = [1001, 2002, 3003, 4004];
    for (const [seat, id, n] of [
      [a, A, answers[0]],
      [b, B, answers[1]],
      [c, C, answers[2]],
      [d, D, answers[3]],
    ] as const) {
      seat.chooseNumberFn = (_view, offer) => {
        asked.push(id);
        expect(offer.min).toBe(0);
        expect(offer.max).toBeUndefined();
        expect(offer.prompt).toBe("Secretly choose a number");
        seen.push(game.state.eventLog.filter((e) => e.type === "number-chosen" || e.type === "vote-cast"));
        // What the next chooser is sent says nothing about the numbers before.
        const sent = JSON.stringify(viewFor(game.state, game.registry, id));
        expect(answers.filter((answer) => sent.includes(String(answer)))).toEqual([]);
        return n;
      };
    }
    cast(game, spell);
    expect(asked).toEqual([A, B, C, D]);
    expect(seen.every((events) => events.length === 0)).toBe(true);
    const revealed = game.state.eventLog.filter(
      (e): e is Extract<GameEvent, { type: "votes-finished" }> => e.type === "votes-finished",
    );
    expect(revealed).toHaveLength(1);
    expect(revealed[0].secret).toBe(true);
    expect(revealed[0].votes.map((v) => ("number" in v.choice ? v.choice.number : -1))).toEqual(answers);
    expect(game.state.eventLog.some((e) => e.type === "number-chosen")).toBe(false);
  });

  it("refuses a negative number", () => {
    const { game, spell } = board([0, 0, 0, 0]);
    cast(game, spell, { settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-number" || s.zones.shared.stack.length === 0);
    expect(game.state.awaiting?.kind).toBe("choose-number");
    expect(game.canDispatch({ type: "choose-number", player: A, number: -1 })).toMatch(/less than 0/);
  });
});

describe("Menacing Ogre: the highest number loses that much life", () => {
  it("you alone highest: you lose it and it gets the counters", () => {
    const { game, a, b } = table();
    a.chooseNumberFn = () => 3;
    b.chooseNumberFn = () => 1;
    const ogre = enter(game, "Menacing Ogre");
    expect(life(game, A)).toBe(17);
    expect(life(game, B)).toBe(20);
    expect(pt(game, ogre)).toEqual({ power: 5, toughness: 5 });
  });

  it("a tie takes both, and the counters come with it", () => {
    const { game, a, b } = table();
    a.chooseNumberFn = () => 2;
    b.chooseNumberFn = () => 2;
    const ogre = enter(game, "Menacing Ogre");
    expect([life(game, A), life(game, B)]).toEqual([18, 18]);
    expect(pt(game, ogre)).toEqual({ power: 5, toughness: 5 });
  });

  it("an opponent highest: no counters", () => {
    const { game, a, b } = table();
    a.chooseNumberFn = () => 0;
    b.chooseNumberFn = () => 4;
    const ogre = enter(game, "Menacing Ogre");
    expect([life(game, A), life(game, B)]).toEqual([20, 16]);
    expect(pt(game, ogre)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("target opponent chooses a number (Choice of Damnations)", () => {
  const board = (players: 2 | 4 = 2) => {
    const t = table({ players });
    lands(t.game, "Swamp", 6);
    return { ...t, spell: toHand(t.game, "Choice of Damnations") };
  };

  it("only the target is asked, and you may have them lose that much life", () => {
    const { game, spell, a, b, c } = board(4);
    let bobAsked = 0;
    let othersAsked = 0;
    a.chooseNumberFn = () => {
      othersAsked += 1;
      return 0;
    };
    c.chooseNumberFn = () => {
      othersAsked += 1;
      return 0;
    };
    b.chooseNumberFn = (_view, offer) => {
      bobAsked += 1;
      expect(offer).toMatchObject({ min: 0, prompt: "Choose a number" });
      return 6;
    };
    pickModes(a, 0);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, spell, { targets: [ref(B)] });
    expect([bobAsked, othersAsked]).toEqual([1, 0]);
    expect(life(game, B)).toBe(14);
    expect(life(game, A)).toBe(20);
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("if you don't, that player keeps that many permanents of their choice and sacrifices the rest", () => {
    const { game, spell, a, b } = board();
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const elves = spawn(game, "Llanowar Elves", B);
    const land = spawn(game, "Forest", B);
    const mine = spawn(game, "Grizzly Bears", A);
    b.chooseNumberFn = () => 2;
    pickModes(a);
    const asked = pickPermanents(b, elves, land);
    cast(game, spell, { targets: [ref(B)] });
    expect(life(game, B)).toBe(20);
    expect(asked.offered).toEqual(expect.arrayContaining([giant, bears, elves, land]));
    expect(asked.offered).not.toContain(mine);
    expect([zone(game, giant), zone(game, bears)]).toEqual(["graveyard", "graveyard"]);
    expect([zone(game, elves), zone(game, land)]).toEqual(["battlefield", "battlefield"]);
    expect(zone(game, mine)).toBe("battlefield");
  });

  it("a number greater than what they control sacrifices nothing (the ruling)", () => {
    const { game, spell, a, b } = board();
    const giant = spawn(game, "Hill Giant", B);
    b.chooseNumberFn = () => 40;
    pickModes(a);
    cast(game, spell, { targets: [ref(B)] });
    expect(zone(game, giant)).toBe("battlefield");
    expect(life(game, B)).toBe(20);
  });

  it("zero sacrifices everything they control", () => {
    const { game, spell, a, b } = board();
    const giant = spawn(game, "Hill Giant", B);
    const land = spawn(game, "Forest", B);
    b.chooseNumberFn = () => 0;
    pickModes(a);
    cast(game, spell, { targets: [ref(B)] });
    expect([zone(game, giant), zone(game, land)]).toEqual(["graveyard", "graveyard"]);
  });

  it("logs the number once, as it's chosen, for everyone to see", () => {
    const { game, spell, a, b } = board();
    b.chooseNumberFn = () => 5;
    pickModes(a, 0);
    cast(game, spell, { targets: [ref(B)] });
    expect(game.state.eventLog.filter((e) => e.type === "vote-cast")).toHaveLength(1);
    expect(game.state.eventLog.some((e) => e.type === "number-chosen")).toBe(false);
  });
});

describe("each player draws up to seven (Diminishing Returns)", () => {
  it("each chooses and draws before the next is asked, from the active player (the ruling), up to seven", () => {
    const { game, a, b } = table();
    lands(game, "Island", 4);
    const spell = toHand(game, "Diminishing Returns");
    const gone = toHand(game, "Grizzly Bears", B);
    const order: string[] = [];
    a.chooseNumberFn = (_view, offer) => {
      expect(offer).toMatchObject({ min: 0, max: 7, prompt: "How many cards do you draw?" });
      order.push(`alice asked, bob has ${hand(game, B).length}`);
      return 3;
    };
    b.chooseNumberFn = (_view, offer) => {
      expect(offer).toMatchObject({ min: 0, max: 7 });
      order.push(`bob asked, alice has ${hand(game, A).length}`);
      return 7;
    };
    cast(game, spell);
    expect(order).toEqual(["alice asked, bob has 0", "bob asked, alice has 3"]);
    expect(hand(game, A)).toHaveLength(3);
    expect(hand(game, B)).toHaveLength(7);
    expect(zone(game, gone)).toBe("library");
    const exiled = Object.values(game.state.objects).filter((o) => o.zone === "exile" && o.owner === A);
    expect(exiled).toHaveLength(10);
    // It's still on the stack as it resolves, so it isn't shuffled in (the ruling).
    expect(graveyard(game, A)).toContain(spell);
  });

  it("zero draws nothing, and more than seven is refused", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const spell = toHand(game, "Diminishing Returns");
    cast(game, spell, { settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-number" || s.zones.shared.stack.length === 0);
    expect(game.state.awaiting).toMatchObject({ kind: "choose-number", player: A, max: 7 });
    expect(game.canDispatch({ type: "choose-number", player: A, number: 8 })).toMatch(/more than 7/);
    settle(game);
    expect(hand(game, A)).toHaveLength(0);
  });
});

describe("a number's bound read as it resolves", () => {
  it("max is an amount, and min still holds when the amount is below it", () => {
    const { game, a } = table({ life: 6 });
    const bounds: (number | undefined)[] = [];
    a.chooseNumberFn = (_view, offer) => {
      bounds.push(offer.max);
      return offer.min;
    };
    game.debugApplyEffect(A, {
      kind: "choose-value",
      value: "number",
      max: { lifeTotal: "you" },
      then: { kind: "gain-life", amount: "x" },
    });
    settle(game);
    game.debugApplyEffect(A, {
      kind: "choose-value",
      value: "number",
      min: 8,
      max: { lifeTotal: "you" },
      then: { kind: "gain-life", amount: 0 },
    });
    settle(game);
    expect(bounds).toEqual([6, 8]);
  });

  it("the bound can read the X the answer replaces: up to X, capped", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    game.state.objects[bear].counters["+1/+0"] = 3;
    const offered: (number | undefined)[] = [];
    a.chooseNumberFn = (_view, offer) => {
      offered.push(offer.max);
      return offer.max ?? 0;
    };
    const upToXCapped: EffectSpec = {
      kind: "choose-value",
      value: "number",
      max: { leastOf: ["x", { difference: [4, { countersOn: "source", counter: "+1/+0" }] }] },
      then: { kind: "add-counter", target: "source", counter: "+1/+0", amount: "x" },
    };
    // X is more than the cap leaves room for: the cap holds.
    game.debugApplyEffect(A, upToXCapped, [], { source: bear, x: 3 });
    settle(game);
    expect(offered).toEqual([1]);
    expect(game.state.objects[bear].counters["+1/+0"]).toBe(4);
    // At the cap, nothing more goes on (the Clockwork rulings).
    game.debugApplyEffect(A, upToXCapped, [], { source: bear, x: 3 });
    settle(game);
    expect(offered).toEqual([1, 0]);
    expect(game.state.objects[bear].counters["+1/+0"]).toBe(4);
    // X less than the room: X it is.
    game.state.objects[bear].counters["+1/+0"] = 0;
    game.debugApplyEffect(A, upToXCapped, [], { source: bear, x: 2 });
    settle(game);
    expect(offered).toEqual([1, 0, 2]);
    expect(game.state.objects[bear].counters["+1/+0"]).toBe(2);
  });

  it("a chooser naming nobody asks nothing", () => {
    const { game, a } = table();
    let asked = false;
    a.chooseNumberFn = () => {
      asked = true;
      return 0;
    };
    game.debugApplyEffect(A, {
      kind: "choose-value",
      value: "number",
      who: { target: 0 },
      then: { kind: "gain-life", amount: 3 },
    });
    settle(game);
    expect(asked).toBe(false);
    expect(life(game, A)).toBe(20);
  });
});

/** Cast Shapeshifter for alice and choose `n` as it enters. */
function castShapeshifter({ game, a }: Table, n: string): ObjectId {
  lands(game, "Wastes", 6);
  a.chooseCreatureTypeFn = () => n;
  const card = toHand(game, "Shapeshifter");
  cast(game, card);
  expect(zone(game, card)).not.toBe("hand");
  return card;
}

describe("the last chosen number sets its P/T (Shapeshifter)", () => {
  it("as it enters, then again at your upkeep; declining keeps the last", () => {
    const t = table();
    const { game, a } = t;
    const shifter = castShapeshifter(t, "3");
    expect(pt(game, shifter)).toEqual({ power: 3, toughness: 4 });

    pickModes(a, 0);
    a.chooseNumberFn = (_view, offer) => {
      expect(offer).toMatchObject({ min: 0, max: 7 });
      return 6;
    };
    nextTurn(game);
    nextTurn(game);
    expect(pt(game, shifter)).toEqual({ power: 6, toughness: 1 });

    pickModes(a);
    a.chooseNumberFn = () => 1;
    nextTurn(game);
    nextTurn(game);
    expect(pt(game, shifter)).toEqual({ power: 6, toughness: 1 });
  });

  it("7 and 0 are its ends: at 7 its toughness is 0 (rule 704.5f), and off the battlefield it is 0/7", () => {
    const t = table();
    const { game } = t;
    const big = castShapeshifter(t, "7");
    expect(zone(game, big)).toBe("graveyard");
    expect(pt(game, big)).toEqual({ power: 0, toughness: 7 });

    const wall = castShapeshifter(t, "0");
    expect(pt(game, wall)).toEqual({ power: 0, toughness: 7 });

    const inHand = toHand(game, "Shapeshifter");
    expect(pt(game, inHand)).toEqual({ power: 0, toughness: 7 });
  });

  it("the number stays with the permanent: having left the battlefield, it's 0/7 again", () => {
    const t = table();
    const { game } = t;
    const shifter = castShapeshifter(t, "2");
    expect(pt(game, shifter)).toEqual({ power: 2, toughness: 5 });
    game.debugApplyEffect(B, { kind: "return-to-hand", target: 0 }, [ref(shifter)]);
    settle(game);
    expect(zone(game, shifter)).toBe("hand");
    expect(pt(game, shifter)).toEqual({ power: 0, toughness: 7 });
  });

  it("an answer given after it has left doesn't reach it (rule 400.7)", () => {
    const t = table();
    const { game, a } = t;
    const shifter = castShapeshifter(t, "2");
    pickModes(a, 0);
    let asked = 0;
    a.chooseNumberFn = () => {
      asked += 1;
      game.debugApplyEffect(B, { kind: "return-to-hand", target: 0 }, [ref(shifter)]);
      return 5;
    };
    nextTurn(game);
    nextTurn(game);
    expect(asked).toBe(1);
    expect(zone(game, shifter)).toBe("hand");
    expect(game.state.objects[shifter].chosenOnEnter).not.toBe("5");
  });
});

describe("Volcano Hellion", () => {
  it("deals the number you choose to you and the target, of any size", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    let asked: { min: number; max?: number } | undefined;
    a.chooseNumberFn = (_view, offer) => {
      asked = { min: offer.min, ...(offer.max !== undefined ? { max: offer.max } : {}) };
      return 9;
    };
    a.chooseTargetsFn = () => [ref(giant)];
    enter(game, "Volcano Hellion");
    expect(asked).toEqual({ min: 0 });
    expect(life(game, A)).toBe(11);
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("you may choose 0 (the ruling)", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    a.chooseNumberFn = () => 0;
    a.chooseTargetsFn = () => [ref(giant)];
    enter(game, "Volcano Hellion");
    expect(life(game, A)).toBe(20);
    expect(game.state.objects[giant].damageMarked).toBe(0);
  });

  it("its echo is your life total as the echo trigger resolves (the ruling): too little mana and it's sacrificed", () => {
    const { game, a } = table({ life: 3 });
    const bear = spawn(game, "Grizzly Bears", B);
    a.chooseNumberFn = () => 1;
    a.chooseTargetsFn = () => [ref(bear)];
    const hellion = enter(game, "Volcano Hellion");
    expect(life(game, A)).toBe(2);
    lands(game, "Mountain", 1);
    pickModes(a, 0);
    nextTurn(game);
    nextTurn(game);
    expect(named(game, "Volcano Hellion", A)).toHaveLength(0);
    expect(zone(game, hellion)).toBe("graveyard");
  });

  it("with mana for a life total that has dropped, it pays that much and stays", () => {
    const { game, a } = table({ life: 3 });
    const bear = spawn(game, "Grizzly Bears", B);
    a.chooseNumberFn = () => 1;
    a.chooseTargetsFn = () => [ref(bear)];
    const hellion = enter(game, "Volcano Hellion");
    const [first, second] = lands(game, "Mountain", 2);
    pickModes(a, 0);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, hellion)).toBe("battlefield");
    expect([game.state.objects[first].tapped, game.state.objects[second].tapped]).toEqual([true, true]);
  });
});
