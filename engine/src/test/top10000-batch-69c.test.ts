/**
 * Card batch 69, part c (2026-10-12): EDHREC ranks 6992–7037. Written on the
 * shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  named,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const canCast = (game: Game, card: ObjectId, targets: readonly ObjectId[] = []): boolean =>
  game.canDispatch({ type: "cast-spell", player: A, card, targets: targets.map(ref) }) === null;

describe("Pyrogoyf", () => {
  it("is a Tarmogoyf, and it and each other Lhurgoyf you control deal their power on entering", () => {
    const { game, a } = table();
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Lightning Bolt");
    pickTargets(a, B);
    const goyf = enter(game, "Pyrogoyf");
    expect(pt(game, goyf)).toEqual({ power: 2, toughness: 3 });
    expect(life(game, B)).toBe(18);
    enter(game, "Tarmogoyf");
    expect(life(game, B)).toBe(16);
    // Not a Lhurgoyf, and not an opponent's Lhurgoyf.
    enter(game, "Grizzly Bears");
    enter(game, "Tarmogoyf", B);
    expect(life(game, B)).toBe(16);
  });
});

describe("Aquitect's Will", () => {
  it("floods the land into an Island, and draws only with a Merfolk", () => {
    const { game } = table();
    const forest = spawn(game, "Forest");
    lands(game, "Island", 2);
    const before = hand(game).length;
    cast(game, toHand(game, "Aquitect's Will"), { targets: [ref(forest)] });
    expect(counters(game, forest, "flood")).toBe(1);
    expect(subtypes(game, forest)).toContain("Island");
    expect(hand(game).length).toBe(before);
    spawn(game, "Merfolk Looter");
    cast(game, toHand(game, "Aquitect's Will"), { targets: [ref(forest)] });
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Primeval Protector", () => {
  it("costs {1} less for each creature your opponents control", () => {
    const { game } = table();
    lands(game, "Forest", 7);
    spawn(game, "Grizzly Bears"); // yours: no discount
    for (let i = 0; i < 3; i++) spawn(game, "Grizzly Bears", B);
    const protector = toHand(game, "Primeval Protector");
    expect(canCast(game, protector)).toBe(false);
    spawn(game, "Grizzly Bears", B);
    expect(canCast(game, protector)).toBe(true);
  });
});

describe("Ancestral Statue", () => {
  it("must return itself when it's your only nonland permanent", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const statue = enter(game, "Ancestral Statue");
    expect(zone(game, statue)).toBe("hand");
  });
});

describe("Etali's Favor", () => {
  it("discovers 3 — casting the first nonland card with mana value 3 or less — and pumps", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 3);
    const lions = toLibrary(game, "Savannah Lions");
    toLibrary(game, "Craw Wurm"); // mana value 6: passed over
    a.chooseCastNowFn = (_view, offer) => {
      const way = offer.casts.find((c) => c.card === lions);
      return way === undefined
        ? null
        : { type: "cast-spell", player: A, card: lions, targets: [], via: way.via, ...(offer.free ? { free: true } : {}) };
    };
    cast(game, toHand(game, "Etali's Favor"), { targets: [ref(bears)] });
    expect(zone(game, lions)).toBe("battlefield");
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears).has("trample")).toBe(true);
  });
});

describe("Narset of the Ancient Way", () => {
  it("−2: a discarded nonland card deals its mana value to target creature or planeswalker", () => {
    const { game, a } = table();
    const narset = spawn(game, "Narset of the Ancient Way");
    const wurm = spawn(game, "Craw Wurm", B); // 6/4
    const giant = toLibrary(game, "Hill Giant"); // mana value 4
    pickModes(a, 0);
    a.chooseDiscardsFn = () => [giant];
    pickTargets(a, wurm);
    loyalty(game, narset, -2);
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, wurm)).toBe("graveyard");
  });

  it("−2: a land discarded fires nothing, and declining discards nothing", () => {
    const { game, a } = table();
    const narset = spawn(game, "Narset of the Ancient Way");
    const bears = spawn(game, "Grizzly Bears", B);
    const forest = toLibrary(game, "Forest");
    let asked = 0;
    a.chooseTargetsFn = () => {
      asked += 1;
      return [ref(bears)];
    };
    pickModes(a, 0);
    a.chooseDiscardsFn = () => [forest];
    loyalty(game, narset, -2);
    expect(zone(game, forest)).toBe("graveyard");
    expect(asked).toBe(0);
    expect(zone(game, bears)).toBe("battlefield");

    const narset2 = spawn(game, "Narset of the Ancient Way");
    pickModes(a);
    const before = hand(game).length;
    loyalty(game, narset2, -2);
    expect(hand(game).length).toBe(before + 1);
  });

  it("+1: gains 2 life and makes mana only a noncreature spell can spend", () => {
    const { game, a } = table();
    const narset = spawn(game, "Narset of the Ancient Way");
    pickModes(a, 1); // {R}
    loyalty(game, narset, 1);
    expect(life(game, A)).toBe(22);
    const bolt = toHand(game, "Lightning Bolt");
    const goblin = toHand(game, "Grizzly Bears");
    lands(game, "Forest", 1);
    // {R} pays the Bolt but not the (green) Bears' generic.
    expect(canCast(game, goblin)).toBe(false);
    expect(canCast(game, bolt, [B as unknown as ObjectId])).toBe(true);
  });
});

describe("Inquisitorial Rosette", () => {
  it("makes an attacking Astartes Warrior, then every attacker gains menace", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const rosette = spawn(game, "Inquisitorial Rosette");
    lands(game, "Wastes", 3);
    activate(game, rosette, 0, { targets: [ref(bears)] });
    expect(game.state.objects[rosette].attachedTo).toBe(bears);
    attack(game, a, [bears]);
    expect(tokensNamed(game, "Astartes Warrior Token", A)).toBe(1);
    const [warrior] = named(game, "Astartes Warrior Token", A);
    expect(game.state.objects[warrior].tapped).toBe(false);
    expect(life(game, B)).toBe(16);
    expect(keywords(game, bears).has("menace")).toBe(true);
    expect(keywords(game, warrior).has("menace")).toBe(true);
  });
});

describe("Oversimplify", () => {
  it("gives each player a Fractal with the total power of their own creatures exiled", () => {
    const { game } = table();
    const wurm = spawn(game, "Craw Wurm"); // 6
    spawn(game, "Grizzly Bears"); // 2
    const giant = spawn(game, "Hill Giant", B); // 3
    lands(game, "Forest", 4);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Oversimplify"));
    expect(zone(game, wurm)).toBe("exile");
    expect(zone(game, giant)).toBe("exile");
    const [mine] = named(game, "Fractal Token", A);
    const [theirs] = named(game, "Fractal Token", B);
    expect(counters(game, mine)).toBe(8);
    expect(counters(game, theirs)).toBe(3);
    expect(pt(game, theirs)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Buried in the Garden", () => {
  it("exiles a nonland permanent you don't control until it leaves, and ramps its land", () => {
    const { game, a } = table();
    const forest = spawn(game, "Forest");
    lands(game, "Plains", 4);
    const ring = spawn(game, "Sol Ring", B);
    pickTargets(a, ring);
    const aura = toHand(game, "Buried in the Garden");
    cast(game, aura, { targets: [ref(forest)] });
    expect(zone(game, ring)).toBe("exile");
    expect(game.state.objects[aura].attachedTo).toBe(forest);
    const [buried] = named(game, "Buried in the Garden");
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(buried)]);
    settle(game);
    expect(named(game, "Sol Ring", B)).toHaveLength(1);
  });
});

describe("Marchesa's Decree", () => {
  it("makes you the monarch, and a creature attacking you costs its controller 1 life", () => {
    const { game, b } = table();
    enter(game, "Marchesa's Decree");
    expect(game.state.monarch).toBe(A);
    const bears = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    attack(game, b, [bears], A);
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(18);
  });
});

describe("Armory Automaton", () => {
  it("may attach any number of target Equipment, anyone's, to itself", () => {
    const { game, a } = table();
    const splitter = spawn(game, "Bonesplitter");
    const hammer = spawn(game, "Loxodon Warhammer", B);
    a.chooseTargetsFn = () => [ref(splitter), ref(hammer)];
    pickModes(a, 0);
    const automaton = enter(game, "Armory Automaton");
    expect(game.state.objects[splitter].attachedTo).toBe(automaton);
    expect(game.state.objects[hammer].attachedTo).toBe(automaton);
    expect(controller(game, hammer)).toBe(B);
    expect(pt(game, automaton)).toEqual({ power: 7, toughness: 2 });
  });

  it("declined, attaches none of them", () => {
    const { game, a } = table();
    const splitter = spawn(game, "Bonesplitter");
    a.chooseTargetsFn = () => [ref(splitter)];
    pickModes(a);
    enter(game, "Armory Automaton");
    expect(game.state.objects[splitter].attachedTo ?? null).toBe(null);
  });
});

describe("Meteor Crater", () => {
  it("taps for a colour among your permanents, and nothing without one", () => {
    const { game } = table();
    const crater = spawn(game, "Meteor Crater");
    type Activate = Extract<LegalAction, { kind: "activate-ability" }>;
    const picks = (): unknown[] =>
      game
        .legalActions(A)
        .filter((o): o is Activate => o.kind === "activate-ability" && o.source === crater)
        .map((o) => o.manaColors);
    expect(picks()).toEqual([[]]);
    spawn(game, "Savannah Lions", B); // not yours
    spawn(game, "Grizzly Bears");
    spawn(game, "Savannah Lions");
    expect(picks()).toEqual([["W"], ["G"]]);
  });
});

describe("SOLDIER Military Program", () => {
  it("chooses one — or both while you control a commander", () => {
    const { game, a } = table();
    spawn(game, "SOLDIER Military Program");
    const maxes: number[] = [];
    a.chooseModesFn = (_view, _min, max) => {
      maxes.push(max);
      return max >= 2 ? [0, 1] : [0];
    };
    toStep(game, "begin-combat");
    settle(game);
    expect(maxes).toEqual([1]);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(1);

    const commander = spawn(game, "Grizzly Bears");
    game.state.objects[commander].isCommander = true;
    nextTurn(game);
    nextTurn(game);
    toStep(game, "begin-combat");
    settle(game);
    expect(maxes).toEqual([1, 2]);
    // The new Soldier and the first each got a counter.
    const soldiers = named(game, "Soldier Token", A);
    expect(soldiers.map((id) => counters(game, id)).reduce((x, y) => x + y, 0)).toBe(2);
  });
});

describe("Terror Tide", () => {
  it("gives -X/-X for each permanent card in your graveyard only", () => {
    const { game } = table();
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Forest");
    toGraveyard(game, "Sol Ring");
    toGraveyard(game, "Lightning Bolt"); // not a permanent card
    toGraveyard(game, "Hill Giant", B); // not yours
    const giant = spawn(game, "Hill Giant", B);
    const wurm = spawn(game, "Craw Wurm", B);
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Terror Tide"));
    expect(zone(game, giant)).toBe("graveyard");
    expect(pt(game, wurm)).toEqual({ power: 3, toughness: 1 });
  });
});

describe("Salvation Colossus", () => {
  it("pumps the other creatures when you attack, and unearths for eight energy", () => {
    const { game, a } = table();
    const colossus = spawn(game, "Salvation Colossus");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [colossus]);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("indestructible")).toBe(true);
    expect(pt(game, colossus)).toEqual({ power: 9, toughness: 9 });

    nextTurn(game);
    nextTurn(game);
    const card = toGraveyard(game, "Salvation Colossus");
    game.state.players[A].energy = 7;
    expect(() => activate(game, card, 0)).toThrow();
    game.state.players[A].energy = 8;
    activate(game, card, 0);
    expect(zone(game, card)).toBe("battlefield");
    expect(game.state.players[A].energy).toBe(0);
    expect(keywords(game, card).has("haste")).toBe(true);
  });
});

describe("Graaz, Unstoppable Juggernaut", () => {
  it("makes your other creatures 5/3 Juggernauts that must attack and can't be blocked by Walls", () => {
    const { game, a } = table();
    const graaz = spawn(game, "Graaz, Unstoppable Juggernaut");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 3 });
    expect(subtypes(game, bears)).toEqual(expect.arrayContaining(["Bear", "Juggernaut"]));
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, graaz)).toEqual({ power: 7, toughness: 5 });

    toStep(game, "declare-attackers");
    const offer = game
      .legalActions(A)
      .find((o): o is Extract<LegalAction, { kind: "declare-attackers" }> => o.kind === "declare-attackers");
    expect(offer?.mustAttack).toEqual(expect.arrayContaining([graaz, bears]));

    const wall = spawn(game, "Wall of Omens", B);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    game.advanceUntil((s) => s.awaiting?.kind === "blockers");
    const blocks = game.legalActions(B).find((o) => o.kind === "declare-blockers");
    const wallEntry =
      blocks?.kind === "declare-blockers" ? blocks.eligible.find((e) => e.blocker === wall) : undefined;
    expect(wallEntry?.canBlock ?? []).not.toContain(bears);
    const bearsEntry =
      blocks?.kind === "declare-blockers" ? blocks.eligible.find((e) => e.blocker === theirs) : undefined;
    expect(bearsEntry?.canBlock).toContain(bears);
  });
});

describe("Gut, True Soul Zealot", () => {
  it("may sacrifice an artifact for a 4/1 menace Skeleton that's tapped and attacking", () => {
    const { game, a } = table();
    const gut = spawn(game, "Gut, True Soul Zealot");
    const ring = spawn(game, "Sol Ring");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 1); // the second option, an artifact

    a.chooseSacrificesFn = () => [ring];
    attack(game, a, [gut]);
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(tokensNamed(game, "Skeleton Token (Gut, True Soul Zealot)", A)).toBe(1);
    expect(life(game, B)).toBe(14);
  });

  it("never offers Gut itself as the other creature", () => {
    const { game, a } = table();
    const gut = spawn(game, "Gut, True Soul Zealot");
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    let offered: readonly ObjectId[] = [];
    pickModes(a, 0);
    a.chooseSacrificesFn = (_view, eligible) => {
      offered = eligible;
      return [bears];
    };
    attack(game, a, [gut]);
    expect([...offered].sort()).toEqual([bears, elves].sort());
    expect(graveyard(game)).toContain(bears);
  });
});
