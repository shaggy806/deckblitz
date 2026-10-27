/**
 * Zendikar Rising and its Commander decks (ZNR, ZNC; B114) — the party cards
 * the lead authored with the feature (rule 700.8).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";
import {
  A,
  B,
  C,
  activate,
  cast,
  counters,
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
  toStep,
  tokensNamed,
  zone,
  enter,
} from "./harness.js";

describe("Archpriest of Iona", () => {
  it("has power equal to the party, itself included", () => {
    const { game } = table();
    const archpriest = spawn(game, "Archpriest of Iona");
    expect(pt(game, archpriest)).toEqual({ power: 1, toughness: 2 });
    spawn(game, "Academy Raider");
    spawn(game, "Abbey Matron"); // a second Cleric adds nothing
    expect(pt(game, archpriest)).toEqual({ power: 2, toughness: 2 });
  });

  it("at combat with a full party, gives a creature +1/+1 and flying; without one, nothing", () => {
    const { game, a } = table();
    const archpriest = spawn(game, "Archpriest of Iona");
    spawn(game, "Academy Raider");
    spawn(game, "Aetherblade Agent");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    toStep(game, "precombat-main", B);
    spawn(game, "Aether Adept");
    pickTargets(a, bears);
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears).has("flying")).toBe(true);
    expect(pt(game, archpriest).power).toBe(4);
  });
});

describe("Ravager's Mace", () => {
  it("attaches as it enters; +1/+0 per party creature, and menace", () => {
    const { game, a } = table();
    const raider = spawn(game, "Academy Raider"); // a 1/1 Warrior
    const base = pt(game, raider);
    pickTargets(a, raider);
    const mace = enter(game, "Ravager's Mace");
    expect(game.state.objects[mace].attachedTo).toBe(raider);
    expect(pt(game, raider)).toEqual({ power: base.power + 1, toughness: base.toughness });
    expect(keywords(game, raider).has("menace")).toBe(true);
    spawn(game, "Aetherblade Agent");
    spawn(game, "Abbey Matron");
    expect(pt(game, raider)).toEqual({ power: base.power + 3, toughness: base.toughness });
  });
});

describe("Squad Commander", () => {
  it("makes a Kor Warrior for each creature in the party, counting itself", () => {
    const { game } = table();
    spawn(game, "Abbey Matron");
    spawn(game, "Academy Raider"); // a second Warrior: Squad Commander fills that role either way
    enter(game, "Squad Commander");
    expect(tokensNamed(game, "Kor Warrior Token", A)).toBe(2);
  });

  it("at combat with a full party, creatures get +1/+0 and indestructible", () => {
    const { game } = table();
    const commander = spawn(game, "Squad Commander");
    spawn(game, "Abbey Matron");
    spawn(game, "Aetherblade Agent");
    spawn(game, "Aether Adept");
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, commander)).toEqual({ power: 4, toughness: 3 });
    expect(keywords(game, commander).has("indestructible")).toBe(true);
  });
});

describe("Malakir Blood-Priest", () => {
  it("drains each opponent for the party size", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Academy Raider");
    enter(game, "Malakir Blood-Priest");
    expect(life(game, A)).toBe(22);
    expect(life(game, B)).toBe(18);
  });
});

describe("party cost reductions", () => {
  it("Deadly Alliance costs {1} less per party creature, never below its colored pip", () => {
    const { game } = table();
    spawn(game, "Abbey Matron");
    spawn(game, "Academy Raider");
    spawn(game, "Aetherblade Agent");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 2);
    const alliance = toHand(game, "Deadly Alliance");
    cast(game, alliance, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("a creature spell doesn't count itself: Sea Gate Colossus with no party costs seven", () => {
    const { game } = table();
    lands(game, "Wastes", 6);
    const colossus = toHand(game, "Sea Gate Colossus");
    expect(() => cast(game, colossus)).toThrow();
    spawn(game, "Abbey Matron");
    cast(game, colossus);
    expect(zone(game, colossus)).toBe("battlefield");
  });
});


describe("an opponent with eight or more cards in their graveyard", () => {
  const fill = (game: Game, player: PlayerId, n: number): void => {
    for (let i = 0; i < n; i++) toGraveyard(game, "Wastes", player);
  };

  it("Blackbloom Rogue counts each opponent's graveyard on its own, never yours", () => {
    const { game } = table({ players: 3 });
    const rogue = spawn(game, "Blackbloom Rogue");
    fill(game, A, 8);
    fill(game, B, 4);
    fill(game, C, 4);
    expect(pt(game, rogue)).toEqual({ power: 2, toughness: 3 });
    fill(game, B, 4);
    expect(pt(game, rogue)).toEqual({ power: 5, toughness: 3 });
  });

  it("Relic Golem can't attack or block until then", () => {
    const { game } = table();
    const golem = spawn(game, "Relic Golem");
    expect(game.characteristics(golem).restrictions.has("cant-attack")).toBe(true);
    fill(game, B, 8);
    expect(game.characteristics(golem).restrictions.has("cant-attack")).toBe(false);
    expect(game.characteristics(golem).restrictions.has("cant-block")).toBe(false);
  });

  it("Merfolk Windrobber's sacrifice is activatable only then", () => {
    const { game } = table();
    const robber = spawn(game, "Merfolk Windrobber");
    expect(() => activate(game, robber, 0)).toThrow();
    fill(game, B, 8);
    const before = hand(game).length;
    activate(game, robber, 0);
    expect(zone(game, robber)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 1);
  });

  it("Anticognition then counters outright (no chance to pay) and scries 2", () => {
    const { game, a } = table();
    let scried = 0;
    a.chooseScryFn = () => {
      scried += 1;
      return [];
    };
    fill(game, B, 8);
    lands(game, "Forest", 2);
    lands(game, "Island", 4); // {2} left over: the unless branch could be paid
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    const anti = toHand(game, "Anticognition");
    cast(game, anti, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(scried).toBe(1);
  });
});

describe("kicked spells", () => {
  it("Lullmage's Familiar triggers on a kicked spell, not an unkicked one", () => {
    const { game } = table();
    spawn(game, "Lullmage's Familiar");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 4);
    cast(game, toHand(game, "Shell Shield"), { targets: [ref(bears)] });
    expect(life(game, A)).toBe(20);
    cast(game, toHand(game, "Shell Shield"), { targets: [ref(bears)], kicked: true });
    expect(life(game, A)).toBe(22);
  });

  it("Murasa Sproutling, kicked, returns only a card with a kicker ability", () => {
    const { game, a } = table();
    toGraveyard(game, "Grizzly Bears");
    const shield = toGraveyard(game, "Shell Shield");
    lands(game, "Forest", 5);
    pickTargets(a, shield);
    cast(game, toHand(game, "Murasa Sproutling"), { kicked: true });
    expect(zone(game, shield)).toBe("hand");
  });

  it("Murasa Sproutling doesn't count buyback as a kicker ability", () => {
    const { game } = table();
    // Allay's buyback is authored as `kicker.keyword: "buyback"` — not kicker (rule 702.33).
    const allay = toGraveyard(game, "Allay");
    lands(game, "Forest", 5);
    cast(game, toHand(game, "Murasa Sproutling"), { kicked: true });
    expect(zone(game, allay)).toBe("graveyard");
  });

  it("Verazol enters with a counter per mana spent and pays two of them to copy a kicked spell", () => {
    const { game, a } = table();
    lands(game, "Island", 6);
    lands(game, "Forest", 1);
    const verazol = toHand(game, "Verazol, the Split Current");
    cast(game, verazol, { x: 2 });
    expect(counters(game, verazol)).toBe(4);
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    cast(game, toHand(game, "Shell Shield"), { targets: [ref(bears)], kicked: true });
    expect(counters(game, verazol)).toBe(2);
    // The spell and its copy each give +0/+3.
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 8 });
  });
});

describe("Visions of Beyond", () => {
  it("draws three if any graveyard, yours included, has twenty or more cards", () => {
    const { game } = table();
    lands(game, "Island", 2);
    let visions = toHand(game, "Visions of Beyond");
    let before = hand(game).length;
    cast(game, visions);
    expect(hand(game).length).toBe(before - 1 + 1);
    for (let i = 0; i < 20; i++) toGraveyard(game, "Wastes", A);
    visions = toHand(game, "Visions of Beyond");
    before = hand(game).length;
    cast(game, visions);
    expect(hand(game).length).toBe(before - 1 + 3);
  });
});
