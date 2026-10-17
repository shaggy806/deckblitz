/**
 * The Lord of the Rings: Tales of Middle-earth (LTR) and its Commander set
 * (LTC), batch 1, group c (2026-10-17). Written on the shared table in
 * `harness.ts`, each test from the card's Oracle text.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickModes,
  pickPermanents,
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
  watchTargets,
  zone,
} from "./harness.js";

describe("Fangorn, Tree Shepherd", () => {
  it("gives Treefolk vigilance, adds twice the attacking Treefolk in {G}, and keeps it past the step", () => {
    const { game, a } = table();
    const fangorn = spawn(game, "Fangorn, Tree Shepherd");
    const treefolk = spawn(game, "Blanchwood Treefolk");
    attack(game, a, [fangorn, treefolk]);
    expect(game.state.objects[fangorn].tapped).toBe(false);
    expect(game.state.objects[treefolk].tapped).toBe(false);
    // Added in the declare attackers step, still there in the second main phase.
    expect(game.state.players[A].manaPool.map((u) => u.type)).toEqual(["G", "G", "G", "G"]);
  });
});

describe("Uglúk of the White Hand", () => {
  it("gets two counters for a Goblin or Orc, one for any other creature", () => {
    const { game } = table();
    const ugluk = spawn(game, "Uglúk of the White Hand");
    const orc = spawn(game, "Orcish Artillery");
    const bears = spawn(game, "Grizzly Bears");
    destroy(game, orc);
    expect(counters(game, ugluk)).toBe(2);
    destroy(game, bears);
    expect(counters(game, ugluk)).toBe(3);
  });
});

describe("Assault on Osgiliath", () => {
  it("amasses Orcs X, then Goblins and Orcs you control gain double strike and haste", () => {
    const { game } = table();
    const orc = spawn(game, "Orcish Artillery");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Assault on Osgiliath"), { x: 2 });
    const [army] = named(game, "Army Token");
    expect(counters(game, army)).toBe(2);
    expect(subtypes(game, army)).toContain("Orc");
    for (const id of [army, orc]) {
      expect(keywords(game, id).has("double-strike")).toBe(true);
      expect(keywords(game, id).has("haste")).toBe(true);
    }
    expect(keywords(game, bears).has("double-strike")).toBe(false);
  });
});

describe("Celeborn the Wise", () => {
  it("scries 1 when Elves attack, and gets +1/+1 for each card looked at", () => {
    const { game, a } = table();
    const celeborn = spawn(game, "Celeborn the Wise");
    const elf = spawn(game, "Llanowar Elves");
    attack(game, a, [elf]);
    expect(pt(game, celeborn)).toEqual({ power: 4, toughness: 4 });
    game.debugApplyEffect(A, { kind: "scry", amount: 2 });
    settle(game);
    expect(pt(game, celeborn)).toEqual({ power: 6, toughness: 6 });
  });
});

describe("Lost Isle Calling", () => {
  it("gets a verse counter whenever you scry", () => {
    const { game } = table();
    const isle = spawn(game, "Lost Isle Calling");
    game.debugApplyEffect(A, { kind: "scry", amount: 1 });
    settle(game);
    expect(counters(game, isle, "verse")).toBe(1);
  });

  it("draws one per verse counter it had, and takes an extra turn with seven or more", () => {
    const { game } = table();
    const isle = spawn(game, "Lost Isle Calling");
    game.state.objects[isle].counters.verse = 7;
    lands(game, "Island", 6);
    const before = hand(game).length;
    activate(game, isle, 0);
    expect(zone(game, isle)).toBe("exile");
    expect(hand(game).length).toBe(before + 7);
    expect(game.state.extraTurns).toContain(A);
  });

  it("takes no extra turn with six", () => {
    const { game } = table();
    const isle = spawn(game, "Lost Isle Calling");
    game.state.objects[isle].counters.verse = 6;
    lands(game, "Island", 6);
    const before = hand(game).length;
    activate(game, isle, 0);
    expect(hand(game).length).toBe(before + 6);
    expect(game.state.extraTurns).not.toContain(A);
  });
});

describe("Saradoc, Master of Buckland", () => {
  it("makes a Halfling for itself and for nontoken creatures with power 2 or less only", () => {
    const { game } = table();
    enter(game, "Saradoc, Master of Buckland");
    expect(tokensNamed(game, "Halfling Token", A)).toBe(1);
    enter(game, "Savannah Lions");
    expect(tokensNamed(game, "Halfling Token", A)).toBe(2);
    enter(game, "Craw Wurm");
    expect(tokensNamed(game, "Halfling Token", A)).toBe(2);
  });

  it("taps two other Halflings to get +2/+0 and lifelink", () => {
    const { game } = table();
    const saradoc = spawn(game, "Saradoc, Master of Buckland");
    const one = spawn(game, "Halfling Token");
    const two = spawn(game, "Halfling Token");
    activate(game, saradoc, 0);
    expect(pt(game, saradoc)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, saradoc).has("lifelink")).toBe(true);
    expect(game.state.objects[saradoc].tapped).toBe(false);
    expect(game.state.objects[one].tapped && game.state.objects[two].tapped).toBe(true);
  });
});

describe("Butterbur, Bree Innkeeper", () => {
  it("makes a Food at your end step only if you control none", () => {
    const { game } = table();
    spawn(game, "Butterbur, Bree Innkeeper");
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
  });
});

describe("Eastfarthing Farmer", () => {
  it("makes a Food, then pumps the target +1/+1 for each Food you control", () => {
    const { game, a } = table();
    spawn(game, "Food Token");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    enter(game, "Eastfarthing Farmer");
    expect(named(game, "Food Token", A)).toHaveLength(2);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Ent's Fury", () => {
  it("adds the counter only at power 4 or greater, then pumps and fights", () => {
    const { game } = table();
    const wurm = spawn(game, "Craw Wurm");
    const angel = spawn(game, "Serra Angel", B);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Ent's Fury"), { targets: [ref(wurm), ref(angel)] });
    expect(counters(game, wurm)).toBe(1);
    expect(pt(game, wurm)).toEqual({ power: 8, toughness: 6 });
    expect(zone(game, angel)).toBe("graveyard");

    const { game: game2 } = table();
    const bears = spawn(game2, "Grizzly Bears");
    const lions = spawn(game2, "Savannah Lions", B);
    lands(game2, "Forest", 2);
    cast(game2, toHand(game2, "Ent's Fury"), { targets: [ref(bears), ref(lions)] });
    expect(counters(game2, bears)).toBe(0);
    expect(pt(game2, bears)).toEqual({ power: 3, toughness: 3 });
    expect(zone(game2, lions)).toBe("graveyard");
  });
});

describe("Hew the Entwood", () => {
  it("reveals one per land sacrificed; artifacts enter untapped, lands tapped, the rest go to the bottom", () => {
    const { game, a } = table();
    const paying = lands(game, "Mountain", 5);
    const library = () => game.state.zones.perPlayer[A].library;
    toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Forest");
    toLibrary(game, "Ornithopter");
    pickPermanents(a, ...paying.slice(0, 3));
    a.chooseFromZoneFn = (_view, eligible) => [...eligible];
    cast(game, toHand(game, "Hew the Entwood"));
    expect(paying.slice(0, 3).every((id) => zone(game, id) === "graveyard")).toBe(true);
    const [thopter] = named(game, "Ornithopter");
    const [forest] = named(game, "Forest");
    expect(game.state.objects[thopter].tapped).toBe(false);
    expect(game.state.objects[forest].tapped).toBe(true);
    expect(game.state.objects[library().at(-1)!].cardName).toBe("Grizzly Bears");
    expect(game.state.objects[library()[0]].cardName).toBe("Wastes");
  });
});

describe("Mordor Trebuchet", () => {
  it("makes an attacking Ballistic Boulder when Orcs attack, sacrificed at end of combat", () => {
    const { game, a } = table();
    spawn(game, "Mordor Trebuchet");
    const orc = spawn(game, "Orcish Artillery");
    a.declareAttackersFn = () => [{ attacker: orc, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === A);
    const [boulder] = named(game, "Ballistic Boulder Token");
    expect(game.state.objects[boulder].attacking).toBe(B);
    expect(game.state.objects[boulder].tapped).toBe(true);
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(17);
    expect(named(game, "Ballistic Boulder Token")).toHaveLength(0);
  });
});

describe("Frodo, Determined Hero", () => {
  it("may attach an Equipment with mana value 2 or 3 as it enters", () => {
    const { game, a } = table();
    const morningstar = spawn(game, "Vulshok Morningstar");
    const warhammer = spawn(game, "Loxodon Warhammer");
    const splitter = spawn(game, "Bonesplitter");
    const seen = watchTargets(a, () => [morningstar]);
    pickModes(a, 0);
    const frodo = enter(game, "Frodo, Determined Hero");
    expect(seen.offered[0]).toEqual(expect.arrayContaining([morningstar, warhammer]));
    expect(seen.offered[0]).not.toContain(splitter);
    expect(game.state.objects[morningstar].attachedTo).toBe(frodo);
  });

  it("prevents all damage to it during your turn only", () => {
    const { game } = table();
    const frodo = spawn(game, "Frodo, Determined Hero");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(frodo)] });
    expect(zone(game, frodo)).toBe("battlefield");
    expect(game.state.objects[frodo].damageMarked).toBe(0);
    nextTurn(game);
    lands(game, "Mountain", 1, B);
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [ref(frodo)] });
    expect(zone(game, frodo)).toBe("graveyard");
  });
});

describe("Dúnedain Blade", () => {
  it("equips a Human for {1}, nothing else", () => {
    const { game } = table();
    const blade = spawn(game, "Dúnedain Blade");
    const bears = spawn(game, "Grizzly Bears");
    const human = spawn(game, "Human Soldier Token");
    lands(game, "Plains", 1);
    expect(() => activate(game, blade, 0, { targets: [ref(bears)] })).toThrow();
    activate(game, blade, 0, { targets: [ref(human)] });
    expect(game.state.objects[blade].attachedTo).toBe(human);
    expect(pt(game, human)).toEqual({ power: 3, toughness: 2 });
  });
});

describe("Isolation at Orthanc", () => {
  it("puts the creature second from the top of its owner's library", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 4);
    cast(game, toHand(game, "Isolation at Orthanc"), { targets: [ref(bears)] });
    const library = game.state.zones.perPlayer[B].library;
    expect(game.state.objects[library[0]].cardName).toBe("Wastes");
    expect(game.state.objects[library[1]].cardName).toBe("Grizzly Bears");
  });
});

describe("Bag End Porter", () => {
  it("gets +X/+X as it attacks, X the legendary creatures you control", () => {
    const { game, a } = table();
    const porter = spawn(game, "Bag End Porter");
    spawn(game, "Isamaru, Hound of Konda");
    spawn(game, "Uglúk of the White Hand");
    attack(game, a, [porter]);
    expect(pt(game, porter)).toEqual({ power: 6, toughness: 6 });
  });
});

describe("Oath of Eorl", () => {
  it("I makes two Human Soldiers; III puts an indestructible counter on a Human and makes you the monarch", () => {
    const { game, a } = table();
    const saga = spawn(game, "Oath of Eorl");
    settle(game);
    expect(tokensNamed(game, "Human Soldier Token", A)).toBe(2);
    game.state.objects[saga].counters.lore = 2;
    const [soldier] = named(game, "Human Soldier Token");
    pickTargets(a, soldier);
    toStep(game, "precombat-main");
    settle(game);
    expect(game.state.monarch).toBe(A);
    const marked = named(game, "Human Soldier Token").filter((id) => counters(game, id, "indestructible") === 1);
    expect(marked).toHaveLength(1);
    expect(keywords(game, marked[0]).has("indestructible")).toBe(true);
  });
});

describe("Grey Host Reinforcements", () => {
  it("exiles the target player's graveyard and gets a counter per creature card exiled", () => {
    const { game, a } = table();
    toGraveyard(game, "Grizzly Bears", B);
    toGraveyard(game, "Savannah Lions", B);
    toGraveyard(game, "Lightning Bolt", B);
    pickTargets(a, B);
    const host = enter(game, "Grey Host Reinforcements");
    expect(graveyard(game, B)).toHaveLength(0);
    expect(counters(game, host)).toBe(2);
  });
});

describe("Radagast, Wizard of Wilds", () => {
  it("makes a Beast or a Bird whenever you cast a spell with mana value 5 or greater", () => {
    const { game, a } = table();
    spawn(game, "Radagast, Wizard of Wilds");
    lands(game, "Forest", 8);
    pickModes(a, 1);
    cast(game, toHand(game, "Craw Wurm"));
    expect(tokensNamed(game, "2/2 Blue Bird Token", A)).toBe(1);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(tokensNamed(game, "2/2 Blue Bird Token", A)).toBe(1);
    expect(tokensNamed(game, "3/3 Beast Token", A)).toBe(0);
  });
});

describe("Mordor on the March", () => {
  it("exiles a creature card per copy, makes a hasty token copy of each, exiled at the next end step", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    const lions = toGraveyard(game, "Savannah Lions");
    lands(game, "Mountain", 3);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Ornithopter"));
    a.chooseFromZoneFn = (_view, eligible) => [eligible[0]];
    cast(game, toHand(game, "Mordor on the March"));
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, lions)).toBe("exile");
    const copies = [...named(game, "Grizzly Bears"), ...named(game, "Savannah Lions")];
    expect(copies).toHaveLength(2);
    for (const id of copies) {
      expect(game.state.objects[id].isToken).toBe(true);
      expect(keywords(game, id).has("haste")).toBe(true);
    }
    toStep(game, "end");
    settle(game);
    expect([...named(game, "Grizzly Bears"), ...named(game, "Savannah Lions")]).toHaveLength(0);
  });
});
