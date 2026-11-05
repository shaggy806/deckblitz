/**
 * Batch 255, group A: cards freed by the piles, hand-exile, chosen-player and
 * per-player-count families. One test per clause most likely to be wrong.
 */

import { describe, expect, it } from "vitest";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  C,
  D,
  activate,
  attack,
  cast,
  controller,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  lands,
  life,
  loyalty,
  nextTurn,
  pickFromZone,
  pickModes,
  pickPermanents,
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
  tokensNamed,
  zone,
} from "./harness.js";

describe("Wishclaw Talisman", () => {
  it("tutors, then an opponent gains control of it, who can wish in turn", () => {
    const { game, a } = table();
    const claw = enter(game, "Wishclaw Talisman");
    expect(counters(game, claw, "wish")).toBe(3);
    const angel = toLibrary(game, "Serra Angel");
    lands(game, "Swamp", 1);
    pickFromZone(a, angel);
    activate(game, claw);
    expect(hand(game)).toContain(angel);
    expect(controller(game, claw)).toBe(B);
    expect(counters(game, claw, "wish")).toBe(2);

    nextTurn(game);
    lands(game, "Swamp", 1, B);
    activate(game, claw, 0, { player: B });
    expect(controller(game, claw)).toBe(A);
    expect(counters(game, claw, "wish")).toBe(1);
  });
});

describe("Ob Nixilis, the Hate-Twisted", () => {
  it("-2: the creature's controller draws two, and an opponent is dealt 1 for each", () => {
    const { game } = table();
    const ob = enter(game, "Ob Nixilis, the Hate-Twisted");
    const bears = spawn(game, "Grizzly Bears", B);
    const before = hand(game, B).length;
    loyalty(game, ob, -2, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game, B).length).toBe(before + 2);
    expect(life(game, B)).toBe(18);
  });

  it("-2 on your own creature: you draw two and aren't dealt damage", () => {
    const { game } = table();
    const ob = enter(game, "Ob Nixilis, the Hate-Twisted");
    const bears = spawn(game, "Grizzly Bears", A);
    const before = hand(game, A).length;
    loyalty(game, ob, -2, { targets: [ref(bears)] });
    expect(hand(game, A).length).toBe(before + 2);
    expect(life(game, A)).toBe(20);
  });
});

describe("Olórin's Searing Light", () => {
  const castLight = (game: ReturnType<typeof table>["game"]): void => {
    lands(game, "Mountain", 2);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Olórin's Searing Light"));
  };

  it("each opponent chooses among its greatest power; spell mastery deals each their own creature's last power", () => {
    const { game, b } = table({ players: 3 });
    toGraveyard(game, "Shock");
    toGraveyard(game, "Divination");
    const angel = spawn(game, "Serra Angel", B);
    const other = spawn(game, "Serra Angel", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", C);
    const small = spawn(game, "Grizzly Bears", C);
    const seen = pickPermanents(b, angel);
    castLight(game);
    expect(seen.offered).toEqual(expect.arrayContaining([angel, other]));
    expect(seen.offered).not.toContain(bears);
    expect(zone(game, angel)).toBe("exile");
    expect(zone(game, other)).toBe("battlefield");
    expect(zone(game, giant)).toBe("exile");
    expect(zone(game, small)).toBe("battlefield");
    expect(life(game, B)).toBe(16);
    expect(life(game, C)).toBe(17);
    expect(life(game, A)).toBe(20);
  });

  it("reads the power as it last existed, counters included", () => {
    const { game } = table();
    toGraveyard(game, "Shock");
    toGraveyard(game, "Divination");
    const angel = spawn(game, "Serra Angel", B);
    game.state.objects[angel].counters["+1/+1"] = 2;
    castLight(game);
    expect(zone(game, angel)).toBe("exile");
    expect(life(game, B)).toBe(14);
  });

  it("without spell mastery they exile and aren't dealt damage; with no creature, no damage", () => {
    const { game } = table({ players: 3 });
    toGraveyard(game, "Shock");
    const angel = spawn(game, "Serra Angel", B);
    castLight(game);
    expect(zone(game, angel)).toBe("exile");
    expect(life(game, B)).toBe(20);

    const second = table({ players: 3 });
    toGraveyard(second.game, "Shock");
    toGraveyard(second.game, "Divination");
    const giant = spawn(second.game, "Hill Giant", C);
    castLight(second.game);
    expect(zone(second.game, giant)).toBe("exile");
    expect(life(second.game, B)).toBe(20);
    expect(life(second.game, C)).toBe(17);
  });
});

describe("Unesh, Criosphinx Sovereign", () => {
  it("triggers on itself and another Sphinx you control, not a non-Sphinx or an opponent's Sphinx", () => {
    const { game, a, b } = table();
    let separations = 0;
    b.separatePilesFn = (_view, offer) => {
      separations += 1;
      expect(offer.objects.length).toBe(4);
      return [offer.objects.slice(0, 1), offer.objects.slice(1)];
    };
    a.choosePileFn = () => 1;
    const before = hand(game).length;
    const grave = graveyard(game).length;
    enter(game, "Unesh, Criosphinx Sovereign");
    expect(separations).toBe(1);
    expect(hand(game).length).toBe(before + 3);
    expect(graveyard(game).length).toBe(grave + 1);
    enter(game, "Grizzly Bears");
    enter(game, "Consecrated Sphinx", B);
    expect(separations).toBe(1);
    enter(game, "Consecrated Sphinx");
    expect(separations).toBe(2);
  });

  it("Sphinx spells cost {2} less, but it doesn't reduce its own cost from hand", () => {
    const { game } = table();
    lands(game, "Island", 4);
    expect(() => cast(game, toHand(game, "Unesh, Criosphinx Sovereign"))).toThrow();
    spawn(game, "Unesh, Criosphinx Sovereign");
    const sphinx = toHand(game, "Consecrated Sphinx");
    cast(game, sphinx);
    expect(zone(game, sphinx)).toBe("battlefield");
  });
});

describe("Boreas Charger", () => {
  const plains = (game: ReturnType<typeof table>["game"], n: number): ObjectId[] =>
    Array.from({ length: n }, () => toLibrary(game, "Plains"));

  it("up to the difference: one onto the battlefield tapped, the rest into hand", () => {
    const { game, a } = table({ players: 3 });
    const charger = spawn(game, "Boreas Charger");
    lands(game, "Plains", 1);
    lands(game, "Plains", 4, B);
    const found = plains(game, 5);
    let asked = 0;
    let offeredMax = -1;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    a.chooseFromZoneFn = (_view, _eligible, _min, max) => {
      offeredMax = max;
      return found.slice(0, 3);
    };
    destroy(game, charger);
    // Carol controls fewer lands, so only Bob could be chosen: nothing to ask.
    expect(asked).toBe(0);
    expect(offeredMax).toBe(3);
    expect(zone(game, found[0])).toBe("battlefield");
    expect(game.state.objects[found[0]].tapped).toBe(true);
    expect(zone(game, found[1])).toBe("hand");
    expect(zone(game, found[2])).toBe("hand");
    expect(zone(game, found[3])).toBe("library");
  });

  it("you choose among those with more, and the difference is theirs", () => {
    const { game, a } = table({ players: 4 });
    const charger = spawn(game, "Boreas Charger");
    lands(game, "Plains", 1);
    lands(game, "Plains", 3, B);
    lands(game, "Plains", 5, C);
    const found = plains(game, 5);
    let asked = 0;
    let offeredMax = -1;
    a.chooseModesFn = () => {
      asked += 1;
      return [1];
    };
    a.chooseFromZoneFn = (_view, _eligible, _min, max) => {
      offeredMax = max;
      return found.slice(0, 1);
    };
    destroy(game, charger);
    expect(asked).toBe(1);
    expect(offeredMax).toBe(4);
    expect(life(game, D)).toBe(20);
  });

  it("with no opponent ahead you still search and shuffle, finding nothing", () => {
    const { game } = table();
    const charger = spawn(game, "Boreas Charger");
    lands(game, "Plains", 2);
    lands(game, "Plains", 2, B);
    const found = plains(game, 3);
    const searches = (): number => game.state.eventLog.filter((e) => e.type === "library-searched" && e.player === A).length;
    const before = searches();
    destroy(game, charger);
    expect(searches()).toBe(before + 1);
    for (const id of found) expect(zone(game, id)).toBe("library");
  });

  it("triggers on any way out, not only dying", () => {
    const { game, a } = table();
    const charger = spawn(game, "Boreas Charger");
    lands(game, "Plains", 1, B);
    const found = plains(game, 1);
    pickFromZone(a, found[0]);
    game.debugApplyEffect(B, { kind: "return-to-hand", target: 0 }, [ref(charger)]);
    settle(game);
    expect(zone(game, found[0])).toBe("battlefield");
  });
});

describe("Multiple Choice", () => {
  const ELEMENTAL = "4/4 Blue Red Elemental Token";
  const go = (game: ReturnType<typeof table>["game"], x: number): void => {
    lands(game, "Island", x + 1);
    cast(game, toHand(game, "Multiple Choice"), { x });
  };

  it("X=0 does nothing; X=1 scries and draws; X=3 makes the token", () => {
    const zero = table();
    const zeroHand = hand(zero.game).length;
    go(zero.game, 0);
    expect(hand(zero.game).length).toBe(zeroHand);
    expect(tokensNamed(zero.game, ELEMENTAL)).toBe(0);

    const one = table();
    const oneHand = hand(one.game).length;
    let scried = 0;
    one.a.chooseScryFn = () => {
      scried += 1;
      return [];
    };
    go(one.game, 1);
    expect(scried).toBe(1);
    expect(hand(one.game).length).toBe(oneHand + 1);
    expect(tokensNamed(one.game, ELEMENTAL)).toBe(0);

    const three = table();
    const threeHand = hand(three.game).length;
    go(three.game, 3);
    expect(tokensNamed(three.game, ELEMENTAL)).toBe(1);
    expect(hand(three.game).length).toBe(threeHand);
  });

  it("X=2: you may choose a player, and they choose which of their creatures returns", () => {
    const { game, a, b } = table();
    const first = spawn(game, "Grizzly Bears", B);
    const second = spawn(game, "Hill Giant", B);
    const answers: number[][] = [[0], [1]];
    a.chooseModesFn = () => answers.shift() ?? [];
    const seen = pickPermanents(b, second);
    go(game, 2);
    expect(seen.offered).toEqual(expect.arrayContaining([first, second]));
    expect(zone(game, second)).toBe("hand");
    expect(zone(game, first)).toBe("battlefield");
  });

  it("X=2: declining the choice returns nothing; choosing yourself returns yours", () => {
    const declined = table();
    const bears = spawn(declined.game, "Grizzly Bears", B);
    pickModes(declined.a);
    go(declined.game, 2);
    expect(zone(declined.game, bears)).toBe("battlefield");

    const yours = table();
    const mine = spawn(yours.game, "Grizzly Bears", A);
    const theirs = spawn(yours.game, "Grizzly Bears", B);
    const answers: number[][] = [[0], [0]];
    yours.a.chooseModesFn = () => answers.shift() ?? [];
    go(yours.game, 2);
    expect(zone(yours.game, mine)).toBe("hand");
    expect(zone(yours.game, theirs)).toBe("battlefield");
  });

  it("X=4 or more does all of the above", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const before = hand(game).length;
    const answers: number[][] = [[0], [1]];
    a.chooseModesFn = () => answers.shift() ?? [];
    go(game, 5);
    expect(hand(game).length).toBe(before + 1);
    expect(zone(game, bears)).toBe("hand");
    expect(tokensNamed(game, ELEMENTAL)).toBe(1);
  });
});

describe("Faller's Faithful", () => {
  it("its controller draws two if it wasn't dealt damage this turn", () => {
    const { game, a } = table();
    const angel = spawn(game, "Serra Angel", B);
    const before = hand(game, B).length;
    pickTargets(a, angel);
    enter(game, "Faller's Faithful");
    expect(zone(game, angel)).toBe("graveyard");
    expect(hand(game, B).length).toBe(before + 2);
  });

  it("no draw if it was dealt damage this turn", () => {
    const { game, a } = table();
    const angel = spawn(game, "Serra Angel", B);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(angel)] });
    const before = hand(game, B).length;
    pickTargets(a, angel);
    enter(game, "Faller's Faithful");
    expect(zone(game, angel)).toBe("graveyard");
    expect(hand(game, B).length).toBe(before);
  });

  it("no target, no draw", () => {
    const { game, a } = table();
    spawn(game, "Serra Angel", B);
    const mine = hand(game, A).length;
    const theirs = hand(game, B).length;
    pickTargets(a, null);
    enter(game, "Faller's Faithful");
    expect(hand(game, A).length).toBe(mine);
    expect(hand(game, B).length).toBe(theirs);
  });
});

describe("End of the Hunt", () => {
  it("the target opponent chooses among the greatest mana value, creatures and planeswalkers both", () => {
    const { game, b } = table();
    const angel = spawn(game, "Serra Angel", B);
    const ob = spawn(game, "Ob Nixilis, the Hate-Twisted", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const rock = spawn(game, "Sol Ring", B);
    const seen = pickPermanents(b, ob);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "End of the Hunt"), { targets: [ref(B)] });
    expect(seen.offered).toEqual(expect.arrayContaining([angel, ob]));
    expect(seen.offered).not.toContain(bears);
    expect(seen.offered).not.toContain(rock);
    expect(zone(game, ob)).toBe("exile");
    expect(zone(game, angel)).toBe("battlefield");
  });
});

describe("Emissary of Despair", () => {
  it("that player loses 1 life for each artifact they control, not yours", () => {
    const { game, a } = table();
    const emissary = spawn(game, "Emissary of Despair");
    spawn(game, "Sol Ring", B);
    spawn(game, "Sol Ring", B);
    spawn(game, "Sol Ring", A);
    attack(game, a, [emissary]);
    expect(life(game, B)).toBe(16);
    expect(life(game, A)).toBe(20);
  });
});

describe("Appetite for Brains", () => {
  it("offers only mana value 4 or greater, and exiles the choice", () => {
    const { game, a } = table();
    const angel = toHand(game, "Serra Angel", B);
    const giant = toHand(game, "Hill Giant", B);
    const bears = toHand(game, "Grizzly Bears", B);
    const seen = pickFromZone(a, angel);
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Appetite for Brains"), { targets: [ref(B)] });
    expect(seen.offered).toEqual(expect.arrayContaining([angel, giant]));
    expect(seen.offered).not.toContain(bears);
    expect(zone(game, angel)).toBe("exile");
    expect(zone(game, giant)).toBe("hand");
  });
});

describe("Prophesied End", () => {
  it("a creature not attacking: its controller draws", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const before = hand(game, B).length;
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Prophesied End"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game, B).length).toBe(before + 1);
  });

  it("an attacking creature: no draw", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    lands(game, "Plains", 2);
    const spell = toHand(game, "Prophesied End");
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "declare-blockers");
    expect(game.state.objects[bears].attacking).not.toBeNull();
    const before = hand(game, A).length;
    cast(game, spell, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    // The spell left her hand, and nothing was drawn.
    expect(hand(game, A).length).toBe(before - 1);
  });
});

describe("Check for Traps", () => {
  const run = (card: string | null): { a: number; b: number; card?: ObjectId; game: ReturnType<typeof table>["game"] } => {
    const { game, a } = table();
    const id = card === null ? undefined : toHand(game, card, B);
    if (id !== undefined) pickFromZone(a, id);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Check for Traps"), { targets: [ref(B)] });
    return { a: life(game, A), b: life(game, B), card: id, game };
  };

  it("an instant: they lose 1", () => {
    const r = run("Shock");
    expect(zone(r.game, r.card!)).toBe("exile");
    expect([r.a, r.b]).toEqual([20, 19]);
  });

  it("a card with flash: they lose 1", () => {
    const r = run("Ambush Viper");
    expect(zone(r.game, r.card!)).toBe("exile");
    expect([r.a, r.b]).toEqual([20, 19]);
  });

  it("anything else: you lose 1", () => {
    const r = run("Grizzly Bears");
    expect(zone(r.game, r.card!)).toBe("exile");
    expect([r.a, r.b]).toEqual([19, 20]);
  });

  it("no nonland card to choose: you lose 1", () => {
    const r = run(null);
    expect([r.a, r.b]).toEqual([19, 20]);
  });
});

describe("Witness the End", () => {
  it("they choose two cards to exile and lose 2", () => {
    const { game, b } = table();
    const first = toHand(game, "Grizzly Bears", B);
    const second = toHand(game, "Hill Giant", B);
    const third = toHand(game, "Serra Angel", B);
    const before = hand(game, B).length;
    pickFromZone(b, first, third);
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Witness the End"), { targets: [ref(B)] });
    expect(zone(game, first)).toBe("exile");
    expect(zone(game, third)).toBe("exile");
    expect(zone(game, second)).toBe("hand");
    expect(hand(game, B).length).toBe(before - 2);
    expect(life(game, B)).toBe(18);
  });

  it("with an empty hand they still lose 2", () => {
    const { game } = table({ openingHandSize: 0 });
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Witness the End"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
  });
});

describe("Chimney Imp", () => {
  it("dies: the target opponent chooses a card from their hand for the top of their library", () => {
    const { game, a, b } = table();
    const imp = spawn(game, "Chimney Imp");
    const bears = toHand(game, "Grizzly Bears", B);
    const before = hand(game, B).length;
    pickTargets(a, B);
    pickFromZone(b, bears);
    destroy(game, imp);
    expect(zone(game, bears)).toBe("library");
    expect(hand(game, B).length).toBe(before - 1);
  });
});

describe("Pallimud", () => {
  it("its power is the chosen opponent's tapped lands, its toughness 3", () => {
    const { game } = table();
    spawn(game, "Swamp", B, { tapped: true });
    spawn(game, "Swamp", B, { tapped: true });
    spawn(game, "Swamp", B);
    spawn(game, "Swamp", A, { tapped: true });
    lands(game, "Mountain", 3);
    const pallimud = toHand(game, "Pallimud");
    cast(game, pallimud);
    expect(zone(game, pallimud)).toBe("battlefield");
    expect(pt(game, pallimud)).toEqual({ power: 2, toughness: 3 });
    spawn(game, "Swamp", B, { tapped: true });
    expect(pt(game, pallimud).power).toBe(3);
  });
});
