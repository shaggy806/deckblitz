/**
 * Zendikar Rising and its Commander decks (ZNR, ZNC; B114) — group b: party
 * cards, kicker, and the Rogues. Party creatures used throughout: Abbey Matron
 * (Cleric), Academy Raider (Warrior), Aetherblade Agent (Rogue), Aether Adept
 * (Wizard).
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  C,
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

describe("Zareth San, the Trickster", () => {
  it("swaps in for an unblocked attacking Rogue, then steals a permanent card from the graveyard", () => {
    const { game, a } = table();
    const agent = spawn(game, "Aetherblade Agent");
    lands(game, "Island", 2);
    lands(game, "Swamp", 2);
    const zareth = toHand(game, "Zareth San, the Trickster");
    const bears = toGraveyard(game, "Grizzly Bears", B);
    a.declareAttackersFn = () => [{ attacker: agent, defender: B }];
    toStep(game, "declare-blockers");
    activate(game, zareth, 0);
    // Activated from the hand, a hidden zone: the card is revealed (rule 602.2a).
    expect(game.eventsOfType("cards-revealed").some((e) => e.from === "hand" && e.objects.includes(zareth))).toBe(true);
    expect(zone(game, agent)).toBe("hand");
    expect(zone(game, zareth)).toBe("battlefield");
    expect(game.state.objects[zareth].tapped).toBe(true);
    pickTargets(a, bears);
    pickModes(a, 0);
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(16);
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
  });

  it("can't be activated before blockers are declared", () => {
    const { game, a } = table();
    const agent = spawn(game, "Aetherblade Agent");
    lands(game, "Island", 2);
    lands(game, "Swamp", 2);
    const zareth = toHand(game, "Zareth San, the Trickster");
    a.declareAttackersFn = () => [{ attacker: agent, defender: B }];
    toStep(game, "declare-attackers");
    expect(() => activate(game, zareth, 0)).toThrow();
  });
});

describe("Nimble Trapfinder", () => {
  it("can't be blocked once another party-type permanent entered under your control this turn", () => {
    const { game } = table();
    const trapfinder = enter(game, "Nimble Trapfinder");
    expect(keywords(game, trapfinder).has("unblockable")).toBe(false);
    enter(game, "Grizzly Bears");
    expect(keywords(game, trapfinder).has("unblockable")).toBe(false);
    enter(game, "Abbey Matron");
    expect(keywords(game, trapfinder).has("unblockable")).toBe(true);
  });

  it("with a full party at combat, creatures draw a card on combat damage to a player", () => {
    const { game, a } = table();
    spawn(game, "Nimble Trapfinder");
    spawn(game, "Abbey Matron");
    spawn(game, "Aether Adept");
    const raider = spawn(game, "Academy Raider");
    toStep(game, "begin-combat");
    settle(game);
    const before = hand(game, A).length;
    attack(game, a, [raider]);
    expect(hand(game, A).length).toBe(before + 1);
  });
});

describe("Concerted Defense", () => {
  it("asks {1} plus one per party creature", () => {
    const { game, a } = table();
    spawn(game, "Abbey Matron");
    spawn(game, "Academy Raider");
    lands(game, "Island", 6); // 4 for the two spells, 2 spare: short of {3}
    const divination = toHand(game, "Divination");
    const defense = toHand(game, "Concerted Defense");
    pickModes(a, 0); // would pay, if {3} were there
    cast(game, divination, { settle: false });
    cast(game, defense, { targets: [ref(divination)] });
    expect(zone(game, divination)).toBe("graveyard");
  });

  it("is paid with three spare mana for a party of two", () => {
    const { game, a } = table();
    spawn(game, "Abbey Matron");
    spawn(game, "Academy Raider");
    lands(game, "Island", 7);
    const divination = toHand(game, "Divination");
    const defense = toHand(game, "Concerted Defense");
    const before = hand(game, A).length;
    pickModes(a, 0);
    cast(game, divination, { settle: false });
    cast(game, defense, { targets: [ref(divination)] });
    expect(hand(game, A).length).toBe(before - 2 + 2);
  });
});

describe("Reclaim the Wastes", () => {
  it("finds one basic land, or two when kicked", () => {
    const { game, a } = table();
    a.chooseFromZoneFn = (_view, eligible, _min, max) => eligible.slice(0, max);
    lands(game, "Forest", 5);
    const first = toHand(game, "Reclaim the Wastes");
    let before = hand(game, A).length;
    cast(game, first);
    expect(hand(game, A).length).toBe(before - 1 + 1);
    const second = toHand(game, "Reclaim the Wastes");
    before = hand(game, A).length;
    cast(game, second, { kicked: true });
    expect(hand(game, A).length).toBe(before - 1 + 2);
  });
});

describe("Cleric of Life's Bond", () => {
  it("gains 1 for another Cleric, and grows on the first life gain each turn only", () => {
    const { game } = table();
    const cleric = spawn(game, "Cleric of Life's Bond");
    enter(game, "Abbey Matron");
    expect(life(game, A)).toBe(21);
    expect(counters(game, cleric)).toBe(1);
    enter(game, "Abbey Matron");
    expect(life(game, A)).toBe(22);
    expect(counters(game, cleric)).toBe(1);
  });
});

describe("Relic Robber", () => {
  it("gives the damaged player a Goblin Construct", () => {
    const { game, a } = table();
    const robber = spawn(game, "Relic Robber");
    attack(game, a, [robber]);
    expect(tokensNamed(game, "Goblin Construct Token", B)).toBe(1);
    expect(tokensNamed(game, "Goblin Construct Token", A)).toBe(0);
  });
});

describe("Journey to Oblivion", () => {
  it("costs only {W} with a full party, and exiles an opponent's nonland permanent", () => {
    const { game, a } = table();
    spawn(game, "Abbey Matron");
    spawn(game, "Academy Raider");
    spawn(game, "Aetherblade Agent");
    spawn(game, "Aether Adept");
    lands(game, "Plains", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    cast(game, toHand(game, "Journey to Oblivion"));
    expect(zone(game, bears)).toBe("exile");
  });
});

describe("Kitesail Cleric", () => {
  it("taps up to two creatures only when kicked", () => {
    const { game, a } = table();
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 5);
    pickTargets(a, one, two);
    cast(game, toHand(game, "Kitesail Cleric"));
    expect(game.state.objects[one].tapped).toBe(false);
    cast(game, toHand(game, "Kitesail Cleric"), { kicked: true });
    expect(game.state.objects[one].tapped).toBe(true);
    expect(game.state.objects[two].tapped).toBe(true);
  });
});

describe("Shadow Stinger", () => {
  it("taps another Rogue for deathtouch, and mills the player it hits", () => {
    const { game, a } = table();
    const stinger = spawn(game, "Shadow Stinger");
    expect(() => activate(game, stinger, 0)).toThrow();
    const agent = spawn(game, "Aetherblade Agent");
    activate(game, stinger, 0);
    expect(game.state.objects[agent].tapped).toBe(true);
    expect(keywords(game, stinger).has("deathtouch")).toBe(true);
    attack(game, a, [stinger]);
    expect(graveyard(game, B).length).toBe(3);
  });
});

describe("Dauntless Unity", () => {
  it("is +1/+1, or +2/+1 kicked", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 6);
    cast(game, toHand(game, "Dauntless Unity"));
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    cast(game, toHand(game, "Dauntless Unity"), { kicked: true });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 4 });
  });
});

describe("Seafloor Stalker", () => {
  it("costs {1} less per party creature, itself included", () => {
    const { game } = table();
    const stalker = spawn(game, "Seafloor Stalker");
    spawn(game, "Abbey Matron");
    spawn(game, "Academy Raider");
    lands(game, "Island", 1);
    expect(() => activate(game, stalker, 0)).toThrow(); // party of three: {1}{U}
    lands(game, "Island", 1);
    activate(game, stalker, 0);
    expect(pt(game, stalker).power).toBe(3);
    expect(keywords(game, stalker).has("unblockable")).toBe(true);
  });
});

describe("Pyroclastic Hellion", () => {
  it("returning a land deals 2 to each opponent; declining deals nothing", () => {
    const { game, a } = table({ players: 3 });
    const [forest] = lands(game, "Forest", 1);
    pickPermanents(a, forest);
    enter(game, "Pyroclastic Hellion");
    expect(zone(game, forest)).toBe("hand");
    expect(life(game, B)).toBe(18);
    expect(life(game, C)).toBe(18);
    expect(life(game, A)).toBe(20);
    lands(game, "Forest", 1);
    pickPermanents(a);
    enter(game, "Pyroclastic Hellion");
    expect(life(game, B)).toBe(18);
  });
});

describe("Nalia de'Arnise", () => {
  it("casts party-type creature spells from the top of the library, nothing else", () => {
    const { game } = table();
    spawn(game, "Nalia de'Arnise");
    lands(game, "Forest", 2);
    lands(game, "Swamp", 3);
    const bears = toLibrary(game, "Grizzly Bears");
    expect(() => cast(game, bears, { via: "library-top" })).toThrow();
    const agent = toLibrary(game, "Aetherblade Agent");
    cast(game, agent, { via: "library-top" });
    expect(zone(game, agent)).toBe("battlefield");
  });

  it("with a full party at combat, puts a counter on each creature and gives them deathtouch", () => {
    const { game } = table();
    spawn(game, "Nalia de'Arnise");
    spawn(game, "Abbey Matron");
    spawn(game, "Aether Adept");
    const raider = spawn(game, "Academy Raider");
    toStep(game, "begin-combat");
    settle(game);
    expect(counters(game, raider)).toBe(1);
    expect(keywords(game, raider).has("deathtouch")).toBe(true);
  });
});
