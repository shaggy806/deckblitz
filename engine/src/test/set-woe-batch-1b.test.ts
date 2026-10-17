/**
 * The set walk, Wilds of Eldraine (WOE/WOC), batch 1, part b (2026-10-17). Written on the shared
 * table in `harness.ts`, each test from the card's Oracle text and rulings.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
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
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

const RAT = "Rat Token (Can't Block)";

describe("Ashiok's Reaper / Warehouse Tabby", () => {
  it("draws (and makes a Rat) when an enchantment you control goes to a graveyard — not an opponent's", () => {
    const { game } = table();
    spawn(game, "Ashiok's Reaper");
    spawn(game, "Warehouse Tabby");
    const mine = spawn(game, "Rhystic Study");
    const theirs = spawn(game, "Rhystic Study", B);
    const before = hand(game).length;
    destroy(game, theirs);
    expect(hand(game).length).toBe(before);
    expect(tokensNamed(game, RAT, A)).toBe(0);
    destroy(game, mine);
    expect(hand(game).length).toBe(before + 1);
    expect(tokensNamed(game, RAT, A)).toBe(1);
  });
});

describe("Picklock Prankster // Free the Fae", () => {
  it("mills four, then must take an instant, sorcery or Faerie card — an adventurer only if it's a Faerie", () => {
    const { game, a } = table();
    const old = toGraveyard(game, "Opt");
    const island = toLibrary(game, "Island");
    const prankster2 = toLibrary(game, "Picklock Prankster");
    const unicorn = toLibrary(game, "Lonesome Unicorn");
    const bolt = toLibrary(game, "Lightning Bolt");
    const card = toHand(game, "Picklock Prankster");
    lands(game, "Island", 2);
    const seen = pickFromZone(a, prankster2);
    cast(game, card, { face: 1 });
    expect([...seen.offered].sort()).toEqual([bolt, prankster2].sort());
    expect(seen.offered).not.toContain(old);
    expect(seen.offered).not.toContain(unicorn);
    expect(zone(game, prankster2)).toBe("hand");
    expect(zone(game, island)).toBe("graveyard");
    expect(zone(game, card)).toBe("exile");
  });
});

describe("Freeze in Place", () => {
  it("taps an opponent's creature, puts three stun counters on it and scries 2", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 2);
    let scried = 0;
    a.chooseScryFn = (_view, cards) => {
      scried = cards.length;
      return [];
    };
    cast(game, toHand(game, "Freeze in Place"), { targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(counters(game, bears, "stun")).toBe(3);
    expect(scried).toBe(2);
  });
});

describe("Totentanz, Swarm Piper", () => {
  it("makes a Rat for itself and for each other nontoken creature dying with it, none for a token", () => {
    const { game } = table();
    spawn(game, "Totentanz, Swarm Piper");
    spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 1 }, []);
    settle(game);
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Wrath of God"));
    expect(tokensNamed(game, RAT, A)).toBe(2);
  });

  it("gives deathtouch only to an attacking Rat you control", () => {
    const { game, a } = table();
    const piper = spawn(game, "Totentanz, Swarm Piper");
    game.debugApplyEffect(A, { kind: "create-token", token: RAT, count: 1 }, []);
    settle(game);
    const [rat] = named(game, RAT, A);
    game.state.objects[rat].summoningSick = false;
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 2);
    a.declareAttackersFn = () => [rat, bears].map((attacker) => ({ attacker, defender: B }));
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === A && s.awaiting === null);
    expect(() => activate(game, piper, 0, { targets: [ref(bears)] })).toThrow();
    activate(game, piper, 0, { targets: [ref(rat)] });
    expect(keywords(game, rat).has("deathtouch")).toBe(true);
  });
});

describe("Plunge into Winter", () => {
  it("can be cast with no target, to scry 1 and draw", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    let scried = 0;
    a.chooseScryFn = (_view, cards) => {
      scried = cards.length;
      return [];
    };
    const before = hand(game).length;
    pickTargets(a, null);
    cast(game, toHand(game, "Plunge into Winter"), { targets: [null] });
    expect(scried).toBe(1);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Slumbering Keepguard", () => {
  it("scries 1 as an enchantment you control enters and pumps +1/+1 per enchantment you control", () => {
    const { game, a } = table();
    const guard = spawn(game, "Slumbering Keepguard");
    spawn(game, "Rhystic Study");
    spawn(game, "Rhystic Study", B);
    let scried = 0;
    a.chooseScryFn = (_view, cards) => {
      scried += cards.length;
      return [];
    };
    enter(game, "Rhystic Study");
    expect(scried).toBe(1);
    enter(game, "Rhystic Study", B);
    expect(scried).toBe(1);
    lands(game, "Plains", 3);
    activate(game, guard, 0);
    expect(pt(game, guard)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Chancellor of Tales", () => {
  it("may copy an Adventure spell you cast, but not the creature spell of an adventurer", () => {
    const { game, a } = table();
    spawn(game, "Chancellor of Tales");
    const poisoner = toHand(game, "Gumdrop Poisoner");
    lands(game, "Swamp", 4);
    pickModes(a, 0);
    cast(game, poisoner, { face: 1 });
    expect(tokensNamed(game, "Food Token", A)).toBe(2);
    expect(zone(game, poisoner)).toBe("exile");
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    pickTargets(a, null);
    cast(game, poisoner, { via: "adventure", face: 0 });
    expect(zone(game, poisoner)).toBe("battlefield");
    expect(asked).toBe(0);
    expect(tokensNamed(game, "Food Token", A)).toBe(2);
  });
});

describe("Gumdrop Poisoner", () => {
  it("gives -X/-X for the life gained this turn, ignoring life lost", () => {
    const { game, a } = table();
    const wurm = spawn(game, "Craw Wurm", B);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 3 }, []);
    game.debugApplyEffect(A, { kind: "lose-life", amount: 3 }, []);
    settle(game);
    pickTargets(a, wurm);
    enter(game, "Gumdrop Poisoner");
    expect(pt(game, wurm)).toEqual({ power: 3, toughness: 1 });
  });
});

describe("Ogre Chitterlord", () => {
  it("makes two Rats, and pumps every Rat +2/+0 only once you control five", () => {
    const { game } = table();
    enter(game, "Ogre Chitterlord");
    const rats = named(game, RAT, A);
    expect(tokensNamed(game, RAT, A)).toBe(2);
    expect(pt(game, rats[0])).toEqual({ power: 1, toughness: 1 });
    game.debugApplyEffect(A, { kind: "create-token", token: RAT, count: 1 }, []);
    settle(game);
    enter(game, "Ogre Chitterlord");
    expect(tokensNamed(game, RAT, A)).toBe(5);
    for (const rat of named(game, RAT, A)) expect(pt(game, rat)).toEqual({ power: 3, toughness: 1 });
  });
});

describe("Callous Sell-Sword // Burn Together", () => {
  it("enters with a counter per creature that died under your control this turn", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    destroy(game, mine);
    destroy(game, theirs);
    lands(game, "Swamp", 2);
    const sword = toHand(game, "Callous Sell-Sword");
    cast(game, sword);
    expect(counters(game, sword)).toBe(1);
  });

  it("Burn Together: the creature deals its power to the other target, then is sacrificed", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant");
    lands(game, "Mountain", 1);
    const card = toHand(game, "Callous Sell-Sword");
    cast(game, card, { face: 1, targets: [ref(giant), ref(B)] });
    expect(life(game, B)).toBe(17);
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, card)).toBe("exile");
  });

  it("Burn Together: no damage if the creature target is gone; still sacrificed if only the other is", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant");
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Callous Sell-Sword"), { face: 1, targets: [ref(giant), ref(B)], settle: false });
    game.debugApplyEffect(B, { kind: "return-to-hand", target: 0 }, [ref(giant)]);
    settle(game);
    expect(life(game, B)).toBe(20);

    const bears = spawn(game, "Grizzly Bears");
    const target = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Callous Sell-Sword"), { face: 1, targets: [ref(bears), ref(target)], settle: false });
    destroy(game, target, A);
    expect(zone(game, bears)).toBe("graveyard");
    expect(controller(game, bears)).toBe(A);
  });
});

describe("Sleep-Cursed Faerie", () => {
  it("enters tapped with three stun counters", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const faerie = toHand(game, "Sleep-Cursed Faerie");
    cast(game, faerie);
    expect(game.state.objects[faerie].tapped).toBe(true);
    expect(counters(game, faerie, "stun")).toBe(3);
  });
});

describe("Aquatic Alchemist // Bubble Up", () => {
  it("gets +2/+0 for your first instant or sorcery spell each turn only", () => {
    const { game } = table();
    const alchemist = spawn(game, "Aquatic Alchemist");
    lands(game, "Island", 2);
    cast(game, toHand(game, "Opt"));
    expect(pt(game, alchemist)).toEqual({ power: 3, toughness: 3 });
    cast(game, toHand(game, "Opt"));
    expect(pt(game, alchemist)).toEqual({ power: 3, toughness: 3 });
  });

  it("Bubble Up can't target an adventurer card in the graveyard", () => {
    const { game } = table();
    const opt = toGraveyard(game, "Opt");
    const unicorn = toGraveyard(game, "Lonesome Unicorn");
    lands(game, "Island", 3);
    const card = toHand(game, "Aquatic Alchemist");
    expect(() => cast(game, card, { face: 1, targets: [ref(unicorn)] })).toThrow();
    cast(game, card, { face: 1, targets: [ref(opt)] });
    expect(game.state.zones.perPlayer[A].library[0]).toBe(opt);
  });
});

describe("Into the Fae Court", () => {
  it("draws three and makes a flying Faerie that can block only fliers", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const before = hand(game).length;
    cast(game, toHand(game, "Into the Fae Court"));
    expect(hand(game).length).toBe(before + 3);
    const [faerie] = named(game, "Faerie Token (Into the Fae Court)", A);
    expect(keywords(game, faerie).has("flying")).toBe(true);
  });
});

describe("Moment of Valor", () => {
  it("untaps and protects a creature, or destroys only one with power 4 or greater", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    lands(game, "Plains", 6);
    cast(game, toHand(game, "Moment of Valor"), { modes: [0], targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bears).has("indestructible")).toBe(true);
    const small = spawn(game, "Grizzly Bears", B);
    const wurm = spawn(game, "Craw Wurm", B);
    const valor = toHand(game, "Moment of Valor");
    expect(() => cast(game, valor, { modes: [1], targets: [ref(small)] })).toThrow();
    cast(game, valor, { modes: [1], targets: [ref(wurm)] });
    expect(zone(game, wurm)).toBe("graveyard");
  });
});

describe("Boundary Lands Ranger", () => {
  it("rummages at the beginning of combat only while you control a creature with power 4 or greater", () => {
    const { game, a } = table();
    spawn(game, "Boundary Lands Ranger");
    const opt = toHand(game, "Opt");
    pickModes(a, 0);
    toStep(game, "begin-combat");
    settle(game);
    expect(zone(game, opt)).toBe("hand");

    const { game: g2, a: a2 } = table();
    spawn(g2, "Boundary Lands Ranger");
    spawn(g2, "Craw Wurm");
    const opt2 = toHand(g2, "Opt");
    const before = hand(g2).length;
    a2.chooseDiscardsFn = () => [opt2];
    pickModes(a2, 0);
    toStep(g2, "begin-combat");
    settle(g2);
    expect(zone(g2, opt2)).toBe("graveyard");
    expect(hand(g2).length).toBe(before);
  });
});

describe("Intrepid Trufflesnout", () => {
  it("makes a Food only when it attacks alone", () => {
    const { game, a } = table();
    const boar = spawn(game, "Intrepid Trufflesnout");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [boar, bears]);
    expect(tokensNamed(game, "Food Token", A)).toBe(0);
    const { game: g2, a: a2 } = table();
    const boar2 = spawn(g2, "Intrepid Trufflesnout");
    spawn(g2, "Grizzly Bears");
    attack(g2, a2, [boar2]);
    expect(tokensNamed(g2, "Food Token", A)).toBe(1);
  });
});

describe("Hopeful Vigil", () => {
  it("makes a Knight, and scries 2 when sacrificed", () => {
    const { game, a } = table();
    const vigil = enter(game, "Hopeful Vigil");
    expect(tokensNamed(game, "Knight Token", A)).toBe(1);
    let scried = 0;
    a.chooseScryFn = (_view, cards) => {
      scried = cards.length;
      return [];
    };
    lands(game, "Plains", 3);
    activate(game, vigil, 0);
    expect(zone(game, vigil)).toBe("graveyard");
    expect(scried).toBe(2);
  });
});

describe("Edgewall Pack", () => {
  it("makes a Rat that can't block", () => {
    const { game } = table();
    enter(game, "Edgewall Pack");
    expect(tokensNamed(game, RAT, A)).toBe(1);
  });
});

describe("Stockpiling Celebrant", () => {
  function setup(yes: boolean): { returned: boolean; scried: number } {
    const { game, a } = table();
    const study = spawn(game, "Rhystic Study");
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Plains");
    spawn(game, "Grizzly Bears", B);
    let scried = 0;
    a.chooseScryFn = (_view, cards) => {
      scried = cards.length;
      return [];
    };
    const seen = watchTargets(a, () => [study]);
    if (yes) pickModes(a, 0);
    else pickModes(a);
    const celebrant = enter(game, "Stockpiling Celebrant");
    expect([...seen.offered[0]].sort()).toEqual([study, bears].sort());
    expect(seen.offered[0]).not.toContain(celebrant);
    return { returned: zone(game, study) === "hand", scried };
  }

  it("may return another nonland permanent you control; if it does, scry 2", () => {
    expect(setup(true)).toEqual({ returned: true, scried: 2 });
    expect(setup(false)).toEqual({ returned: false, scried: 0 });
  });
});

describe("Charging Hooligan", () => {
  it("gets +1/+0 per attacking creature, and trample only while a Rat attacks", () => {
    const { game, a } = table();
    const hooligan = spawn(game, "Charging Hooligan");
    const bears = spawn(game, "Grizzly Bears");
    let seenPower = 0;
    let trample = false;
    a.declareAttackersFn = () => [hooligan, bears].map((attacker) => ({ attacker, defender: B }));
    game.advanceUntil((s) => s.turn.step === "declare-blockers");
    seenPower = pt(game, hooligan).power;
    trample = keywords(game, hooligan).has("trample");
    expect(seenPower).toBe(5);
    expect(trample).toBe(false);

    const { game: g2, a: a2 } = table();
    const h2 = spawn(g2, "Charging Hooligan");
    g2.debugApplyEffect(A, { kind: "create-token", token: RAT, count: 1 }, []);
    settle(g2);
    const [rat] = named(g2, RAT, A);
    g2.state.objects[rat].summoningSick = false;
    a2.declareAttackersFn = () => [h2, rat].map((attacker) => ({ attacker, defender: B }));
    g2.advanceUntil((s) => s.turn.step === "declare-blockers");
    expect(pt(g2, h2).power).toBe(5);
    expect(keywords(g2, h2).has("trample")).toBe(true);
  });
});
