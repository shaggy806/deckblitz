/**
 * Zendikar, group B: the clauses most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  hand,
  keywords,
  lands,
  life,
  pickFromZone,
  pickModes,
  pickPermanents,
  pt,
  ref,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Goblin Guide", () => {
  it("a land on top of the defending player's library goes to their hand", () => {
    const { game, a, b } = table();
    const guide = spawn(game, "Goblin Guide");
    const plains = toLibrary(game, "Plains", B);
    pickFromZone(b, plains);
    const before = hand(game, B).length;
    attack(game, a, [guide]);
    expect(zone(game, plains)).toBe("hand");
    expect(hand(game, B).length).toBe(before + 1);
    expect(life(game, B)).toBe(18);
  });

  it("a nonland card stays on top", () => {
    const { game, a } = table();
    const guide = spawn(game, "Goblin Guide");
    const bears = toLibrary(game, "Grizzly Bears", B);
    const before = hand(game, B).length;
    attack(game, a, [guide]);
    expect(zone(game, bears)).toBe("library");
    const library = game.state.zones.perPlayer[B].library;
    expect(library[library.length - 1] === bears || library[0] === bears).toBe(true);
    expect(hand(game, B).length).toBe(before);
  });
});

describe("Kazuul Warlord", () => {
  it("puts a counter on each Ally creature you control", () => {
    const { game, a } = table();
    const ally = spawn(game, "Akoum Battlesinger");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    const warlord = enter(game, "Kazuul Warlord");
    expect(counters(game, warlord)).toBe(1);
    expect(counters(game, ally)).toBe(1);
    expect(counters(game, bears)).toBe(0);
  });
});

describe("Turntimber Ranger", () => {
  it("makes a Wolf and then grows", () => {
    const { game, a } = table();
    pickModes(a, 0);
    const ranger = enter(game, "Turntimber Ranger");
    expect(tokensNamed(game, "Wolf Token", A)).toBe(1);
    expect(counters(game, ranger)).toBe(1);
  });
});

describe("Quest for the Holy Relic", () => {
  it("finds an Equipment and attaches it to a chosen creature you control", () => {
    const { game, a } = table();
    const quest = spawn(game, "Quest for the Holy Relic");
    game.state.objects[quest].counters.quest = 5;
    const bears = spawn(game, "Grizzly Bears");
    const splitter = toLibrary(game, "Bonesplitter");
    pickFromZone(a, splitter);
    pickPermanents(a, bears);
    activate(game, quest);
    expect(zone(game, quest)).toBe("graveyard");
    expect(zone(game, splitter)).toBe("battlefield");
    expect(game.state.objects[splitter].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
  });

  it("puts it onto the battlefield unattached with no creature", () => {
    const { game, a } = table();
    const quest = spawn(game, "Quest for the Holy Relic");
    game.state.objects[quest].counters.quest = 5;
    const splitter = toLibrary(game, "Bonesplitter");
    pickFromZone(a, splitter);
    activate(game, quest);
    expect(zone(game, splitter)).toBe("battlefield");
    expect(game.state.objects[splitter].attachedTo).toBeNull();
  });
});

describe("World Queller", () => {
  it("each player sacrifices a permanent of the chosen type", () => {
    const { game, a } = table();
    const queller = spawn(game, "World Queller");
    const bobBears = spawn(game, "Grizzly Bears", B);
    const bobLand = spawn(game, "Plains", B);
    const myLand = spawn(game, "Plains");
    pickModes(a, 2); // creature
    toStep(game, "precombat-main");
    expect(zone(game, bobBears)).toBe("graveyard");
    expect(zone(game, bobLand)).toBe("battlefield");
    expect(zone(game, myLand)).toBe("battlefield");
    // Queller is a creature too, and its controller's only one.
    expect(zone(game, queller)).toBe("graveyard");
  });

  it("choosing no type sacrifices nothing", () => {
    const { game, a } = table();
    const queller = spawn(game, "World Queller");
    const bobBears = spawn(game, "Grizzly Bears", B);
    pickModes(a);
    toStep(game, "precombat-main");
    expect(zone(game, bobBears)).toBe("battlefield");
    expect(zone(game, queller)).toBe("battlefield");
  });
});

describe("Vampire Lacerator", () => {
  it("costs a life unless an opponent is at 10 or less", () => {
    const { game } = table();
    spawn(game, "Vampire Lacerator");
    toStep(game, "precombat-main");
    expect(life(game)).toBe(19);
    game.state.players[B].life = 10;
    toStep(game, "precombat-main");
    expect(life(game)).toBe(19);
  });
});

describe("Lethargy Trap", () => {
  it("costs {U} with three attackers, and shrinks them", () => {
    const { game, a } = table();
    const attackers = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    lands(game, "Island", 1);
    a.declareAttackersFn = () => attackers.map((attacker) => ({ attacker, defender: B }));
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.awaiting === null && s.priority.holder === A);
    cast(game, toHand(game, "Lethargy Trap"), { altCost: true });
    for (const id of attackers) expect(pt(game, id)).toEqual({ power: -1, toughness: 2 });
  });

  it("can't be cast for {U} with two attackers", () => {
    const { game, a } = table();
    const attackers = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    lands(game, "Island", 1);
    a.declareAttackersFn = () => attackers.map((attacker) => ({ attacker, defender: B }));
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.awaiting === null && s.priority.holder === A);
    const trap = toHand(game, "Lethargy Trap");
    expect(() => cast(game, trap, { altCost: true })).toThrow(/./);
    // The window was open: the full cost is still payable there.
    lands(game, "Island", 3);
    cast(game, trap);
    for (const id of attackers) expect(pt(game, id)).toEqual({ power: -1, toughness: 2 });
  });
});

describe("Timbermaw Larva", () => {
  it("gets +1/+1 for each Forest as it attacks", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const larva = spawn(game, "Timbermaw Larva");
    attack(game, a, [larva]);
    expect(pt(game, larva)).toEqual({ power: 5, toughness: 5 });
    expect(life(game, B)).toBe(15);
  });
});

describe("Landbind Ritual", () => {
  it("gains 2 life per Plains", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    cast(game, toHand(game, "Landbind Ritual"));
    expect(life(game)).toBe(30);
  });
});

describe("Marsh Casualties", () => {
  it("kicked, gives the target player's creatures -2/-2", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const bobBears = spawn(game, "Grizzly Bears", B);
    const myBears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Marsh Casualties"), { targets: [ref(B)], kicked: true });
    expect(zone(game, bobBears)).toBe("graveyard");
    expect(zone(game, myBears)).toBe("battlefield");
  });

  it("unkicked, -1/-1", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const bobBears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Marsh Casualties"), { targets: [ref(B)] });
    expect(pt(game, bobBears)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Ruinous Minotaur", () => {
  it("its controller sacrifices a land when it hits an opponent", () => {
    const { game, a } = table();
    const [land] = lands(game, "Mountain", 1);
    const bobLand = spawn(game, "Mountain", B);
    const minotaur = spawn(game, "Ruinous Minotaur");
    attack(game, a, [minotaur]);
    expect(life(game, B)).toBe(15);
    expect(zone(game, land)).toBe("graveyard");
    expect(zone(game, bobLand)).toBe("battlefield");
  });
});

describe("Windborne Charge", () => {
  it("needs two creatures you control", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const one = spawn(game, "Grizzly Bears");
    expect(() => cast(game, toHand(game, "Windborne Charge"), { targets: [ref(one), ref(one)] })).toThrow();
  });

  it("pumps both and gives them flying", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Windborne Charge"), { targets: [ref(one), ref(two)] });
    for (const id of [one, two]) {
      expect(pt(game, id)).toEqual({ power: 4, toughness: 4 });
      expect(keywords(game, id).has("flying")).toBe(true);
    }
  });
});

describe("Conqueror's Pledge", () => {
  it("kicked, makes twelve Kor Soldiers", () => {
    const { game } = table();
    lands(game, "Plains", 11);
    cast(game, toHand(game, "Conqueror's Pledge"), { kicked: true });
    expect(tokensNamed(game, "Kor Soldier Token", A)).toBe(12);
  });
});
