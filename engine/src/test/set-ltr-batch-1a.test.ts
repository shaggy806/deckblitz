/**
 * The Lord of the Rings: Tales of Middle-earth (LTR/LTC), batch 1, part a
 * (2026-10-17). Written on the shared table in `harness.ts`, each test from
 * the card's Oracle text.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { ringBearerOf } from "../ring.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  counters,
  enter,
  hand,
  keywords,
  lands,
  life,
  named,
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

/** The next lore counter: alice's next precombat main, settled. */
const nextChapter = (game: Game): void => {
  toStep(game, "precombat-main");
  settle(game);
};

const handNames = (game: Game): string[] => hand(game).map((id) => game.state.objects[id].cardName);

describe("Riders of the Mark", () => {
  it("returns to hand after attacking and makes Soldiers equal to the toughness it had", () => {
    const { game, a } = table();
    const riders = spawn(game, "Riders of the Mark");
    game.debugApplyEffect(A, { kind: "modify-pt", target: 0, power: 0, toughness: 2, duration: "end-of-turn" }, [
      ref(riders),
    ]);
    attack(game, a, [riders]);
    toStep(game, "end");
    settle(game);
    expect(zone(game, riders)).toBe("hand");
    expect(tokensNamed(game, "Human Soldier Token", A)).toBe(6);
  });

  it("stays put and makes nothing if it didn't attack", () => {
    const { game } = table();
    const riders = spawn(game, "Riders of the Mark");
    toStep(game, "end");
    settle(game);
    expect(zone(game, riders)).toBe("battlefield");
    expect(tokensNamed(game, "Human Soldier Token", A)).toBe(0);
  });
});

describe("Gorbag of Minas Morgul", () => {
  it("sacrifices the Goblin that hit, then the chosen mode happens", () => {
    const { game, a } = table();
    spawn(game, "Gorbag of Minas Morgul");
    const piker = spawn(game, "Goblin Piker");
    a.chooseModesFn = (_view, _min, _max, texts) => {
      const treasure = texts.indexOf("Create a Treasure token.");
      return treasure >= 0 ? [treasure] : [0];
    };
    attack(game, a, [piker]);
    expect(zone(game, piker)).toBe("graveyard");
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });

  it("does nothing when you don't sacrifice", () => {
    const { game, a } = table();
    spawn(game, "Gorbag of Minas Morgul");
    const piker = spawn(game, "Goblin Piker");
    const before = hand(game).length;
    pickModes(a);
    attack(game, a, [piker]);
    expect(zone(game, piker)).toBe("battlefield");
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
    expect(hand(game).length).toBe(before);
  });
});

describe("Gríma Wormtongue", () => {
  const sacrificeTo = (game: Game, grima: ObjectId, victim: ObjectId): void => {
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: grima,
      abilityIndex: 0,
      targets: [ref(B)],
      sacrifice: victim,
    });
    settle(game);
  };

  it("stops opponents gaining life, not you", () => {
    const { game } = table();
    spawn(game, "Gríma Wormtongue");
    game.debugApplyEffect(B, { kind: "gain-life", amount: 3 });
    game.debugApplyEffect(A, { kind: "gain-life", amount: 3 });
    expect(life(game, B)).toBe(20);
    expect(life(game, A)).toBe(23);
  });

  it("amasses Orcs 2 only when the sacrificed creature was legendary", () => {
    const { game } = table();
    const grima = spawn(game, "Gríma Wormtongue");
    sacrificeTo(game, grima, spawn(game, "Grizzly Bears"));
    expect(life(game, B)).toBe(19);
    expect(tokensNamed(game, "Army Token", A)).toBe(0);

    game.state.objects[grima].tapped = false;
    sacrificeTo(game, grima, spawn(game, "Isamaru, Hound of Konda"));
    expect(life(game, B)).toBe(18);
    const [army] = named(game, "Army Token", A);
    expect(army).toBeDefined();
    expect(counters(game, army)).toBe(2);
    expect(subtypes(game, army)).toContain("Orc");
  });
});

describe("Haunt of the Dead Marshes", () => {
  it("returns from the graveyard tapped, only while you control a legendary creature", () => {
    const { game } = table();
    const haunt = toGraveyard(game, "Haunt of the Dead Marshes");
    lands(game, "Swamp", 3);
    expect(() => activate(game, haunt, 0)).toThrow();
    spawn(game, "Isamaru, Hound of Konda");
    activate(game, haunt, 0);
    expect(zone(game, haunt)).toBe("battlefield");
    expect(game.state.objects[haunt].tapped).toBe(true);
  });
});

describe("Fall of Gil-galad", () => {
  it("III grants the dies-draw before the fight, so a creature dying in it draws two", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    const wurm = spawn(game, "Craw Wurm", B);
    spawn(game, "Fall of Gil-galad");
    settle(game);
    pickTargets(a, bear);
    nextChapter(game);
    expect(counters(game, bear)).toBe(2);
    const before = hand(game).length;
    pickTargets(a, bear, wurm);
    nextChapter(game);
    expect(zone(game, wurm)).toBe("graveyard");
    expect(zone(game, bear)).toBe("graveyard");
    // The draw step's card, and the two the granted trigger draws.
    expect(hand(game).length).toBe(before + 3);
  });
});

describe("Gandalf, White Rider", () => {
  it("may go into its owner's library fifth from the top when it dies", () => {
    const { game, a } = table();
    const gandalf = spawn(game, "Gandalf, White Rider");
    pickModes(a, 0);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(gandalf)]);
    settle(game);
    expect(zone(game, gandalf)).toBe("library");
    const before = hand(game).length;
    game.debugApplyEffect(A, { kind: "draw", amount: 4 });
    expect(handNames(game)).not.toContain("Gandalf, White Rider");
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    expect(hand(game).length).toBe(before + 5);
    expect(handNames(game)).toContain("Gandalf, White Rider");
  });
});

describe("Morgul-Knife Wound", () => {
  const wounded = () => {
    const env = table();
    const bear = spawn(env.game, "Grizzly Bears", B);
    lands(env.game, "Swamp", 2);
    cast(env.game, toHand(env.game, "Morgul-Knife Wound"), { targets: [ref(bear)] });
    return { ...env, bear };
  };

  it("gives -3/-0, and its controller's upkeep exiles it when they won't pay", () => {
    const { game, b, bear } = wounded();
    expect(pt(game, bear)).toEqual({ power: -1, toughness: 2 });
    pickModes(b);
    toStep(game, "draw", B);
    expect(zone(game, bear)).toBe("exile");
    expect(life(game, B)).toBe(20);
  });

  it("stays when its controller pays 2 life", () => {
    const { game, b, bear } = wounded();
    pickModes(b, 0);
    toStep(game, "draw", B);
    expect(zone(game, bear)).toBe("battlefield");
    expect(life(game, B)).toBe(18);
  });
});

describe("Lothlórien Blade", () => {
  it("equip Elf {2} only reaches an Elf", () => {
    const { game } = table();
    const blade = spawn(game, "Lothlórien Blade");
    const bear = spawn(game, "Grizzly Bears");
    const elf = spawn(game, "Llanowar Elves");
    lands(game, "Wastes", 2);
    expect(() => activate(game, blade, 0, { targets: [ref(bear)] })).toThrow();
    activate(game, blade, 0, { targets: [ref(elf)] });
    expect(game.state.objects[blade].attachedTo).toBe(elf);
  });

  it("the equipped attacker deals its power to a creature defending player controls", () => {
    const { game, a } = table();
    const blade = spawn(game, "Lothlórien Blade");
    const giant = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Craw Wurm", B);
    lands(game, "Wastes", 5);
    activate(game, blade, 1, { targets: [ref(giant)] });
    pickTargets(a, theirs);
    attack(game, a, [giant]);
    expect(game.state.objects[theirs].damageMarked).toBe(3);
    expect(life(game, B)).toBe(17);
  });
});

describe("Eagle of Deliverance", () => {
  it("draws only if the creature's power is 2 or less", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    let before = hand(game).length;
    pickTargets(a, bear);
    enter(game, "Eagle of Deliverance");
    expect(counters(game, bear, "indestructible")).toBe(1);
    expect(hand(game).length).toBe(before + 1);
    before = hand(game).length;
    pickTargets(a, giant);
    enter(game, "Eagle of Deliverance");
    expect(counters(game, giant, "indestructible")).toBe(1);
    expect(hand(game).length).toBe(before);
  });
});

describe("Strider, Ranger of the North", () => {
  it("gives first strike only when the pumped creature has power 4 or greater", () => {
    const { game, a } = table();
    spawn(game, "Strider, Ranger of the North");
    const bear = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    pickTargets(a, bear);
    enter(game, "Wastes");
    expect(pt(game, bear)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bear).has("first-strike")).toBe(false);
    pickTargets(a, giant);
    enter(game, "Wastes");
    expect(pt(game, giant)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, giant).has("first-strike")).toBe(true);
  });
});

describe("Subjugate the Hobbits", () => {
  it("takes each noncommander creature with mana value 3 or less", () => {
    const { game } = table();
    lands(game, "Island", 7);
    const bear = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Craw Wurm", B);
    const commander = spawn(game, "Isamaru, Hound of Konda", B);
    game.state.objects[commander].isCommander = true;
    cast(game, toHand(game, "Subjugate the Hobbits"));
    expect(controller(game, bear)).toBe(A);
    expect(controller(game, giant)).toBe(B);
    expect(controller(game, commander)).toBe(B);
  });
});

describe("Meneldor, Swift Savior", () => {
  it("blinks a creature you own that an opponent controls back under your control", () => {
    const { game, a } = table();
    const meneldor = spawn(game, "Meneldor, Swift Savior");
    const bear = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(bear)]);
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(bear)]);
    expect(controller(game, bear)).toBe(B);
    pickTargets(a, bear);
    attack(game, a, [meneldor]);
    const [back] = named(game, "Grizzly Bears", A);
    expect(back).toBeDefined();
    expect(counters(game, back)).toBe(0);
    expect(named(game, "Grizzly Bears", B)).toHaveLength(0);
  });
});

describe("Erkenbrand, Lord of Westfold", () => {
  it("pumps your creatures when it or another Human enters, not for a non-Human", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears");
    const erkenbrand = enter(game, "Erkenbrand, Lord of Westfold");
    expect(pt(game, bear).power).toBe(3);
    enter(game, "Savannah Lions");
    expect(pt(game, bear).power).toBe(3);
    enter(game, "Thalia, Guardian of Thraben");
    expect(pt(game, bear).power).toBe(4);
    expect(pt(game, erkenbrand)).toEqual({ power: 5, toughness: 3 });
  });
});

describe("Quickbeam, Upstart Ent", () => {
  it("gives up to two target creatures +2/+2 and trample", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bear, theirs);
    enter(game, "Quickbeam, Upstart Ent");
    for (const id of [bear, theirs]) {
      expect(pt(game, id)).toEqual({ power: 4, toughness: 4 });
      expect(keywords(game, id).has("trample")).toBe(true);
    }
  });
});

describe("Song of Eärendil", () => {
  it("III puts a flying counter only on creatures you control without flying", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    spawn(game, "Song of Eärendil");
    settle(game);
    nextChapter(game);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    const [bird] = named(game, "2/2 Blue Bird Token", A);
    expect(bird).toBeDefined();
    nextChapter(game);
    expect(counters(game, bear, "flying")).toBe(1);
    expect(counters(game, bird, "flying")).toBe(0);
    expect(counters(game, theirs, "flying")).toBe(0);
  });
});

describe("Lidless Gaze", () => {
  it("lets you cast an opponent's exiled card with mana of any type", () => {
    const { game } = table();
    const bolt = toLibrary(game, "Lightning Bolt", B);
    lands(game, "Swamp", 3);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lidless Gaze"));
    expect(zone(game, bolt)).toBe("exile");
    expect(game.state.zones.shared.exile.length).toBe(2);
    lands(game, "Swamp", 1);
    cast(game, bolt, { targets: [ref(B)], via: "impulse" });
    expect(life(game, B)).toBe(17);
  });
});

describe("Now for Wrath, Now for Ruin!", () => {
  it("counters and vigilance for your creatures, then the Ring tempts you", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Now for Wrath, Now for Ruin!"));
    expect(counters(game, bear)).toBe(1);
    expect(keywords(game, bear).has("vigilance")).toBe(true);
    expect(counters(game, theirs)).toBe(0);
    expect(keywords(game, theirs).has("vigilance")).toBe(false);
    expect(ringBearerOf(game.state, A)).toBe(bear);
  });
});
