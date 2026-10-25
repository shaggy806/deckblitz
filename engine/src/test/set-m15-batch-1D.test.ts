/**
 * Magic 2015 and Conspiracy, group D: the clause of each card most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  cast,
  counters,
  enter,
  keywords,
  lands,
  life,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
  named,
} from "./harness.js";

describe("Academy Elite", () => {
  it("enters with a counter per instant and sorcery card in every graveyard", () => {
    const { game } = table();
    toGraveyard(game, "Lightning Bolt", A);
    toGraveyard(game, "Counterspell", B);
    toGraveyard(game, "Grizzly Bears", B);
    const elite = enter(game, "Academy Elite");
    expect(counters(game, elite)).toBe(2);
  });
});

describe("Custodi Soulbinders", () => {
  it("counts the other creatures on the battlefield, whoever controls them", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears", A);
    spawn(game, "Hill Giant", B);
    lands(game, "Plains", 1);
    const binders = enter(game, "Custodi Soulbinders");
    expect(counters(game, binders)).toBe(2);
  });
});

describe("Rotfeaster Maggot", () => {
  it("exiles the creature card and gains life equal to its toughness", () => {
    const { game, a } = table();
    const giant = toGraveyard(game, "Hill Giant", B);
    pickTargets(a, giant);
    enter(game, "Rotfeaster Maggot");
    expect(zone(game, giant)).toBe("exile");
    expect(life(game, A)).toBe(23);
  });
});

describe("Paliano, the High City", () => {
  it("with no colours chosen in a draft, its mana ability adds no mana", () => {
    const { game } = table();
    const paliano = spawn(game, "Paliano, the High City");
    activate(game, paliano);
    expect(game.state.objects[paliano].tapped).toBe(true);
    expect(game.state.players[A].manaPool.length).toBe(0);
  });
});

describe("Paragon of Fierce Defiance", () => {
  it("pumps other red creatures and can't give itself haste", () => {
    const { game } = table();
    const paragon = spawn(game, "Paragon of Fierce Defiance");
    const goblin = spawn(game, "Goblin Piker", A, { sick: true });
    lands(game, "Mountain", 1);
    expect(pt(game, paragon)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, goblin)).toEqual({ power: 3, toughness: 2 });
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: paragon, abilityIndex: 0, targets: [ref(paragon)] }),
    ).not.toBeNull();
    activate(game, paragon, 0, { targets: [ref(goblin)] });
    expect(keywords(game, goblin).has("haste")).toBe(true);
  });
});

describe("Kapsho Kitefins", () => {
  it("taps an opponent's creature when another creature you control enters", () => {
    const { game, a } = table();
    spawn(game, "Kapsho Kitefins");
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    enter(game, "Grizzly Bears");
    expect(game.state.objects[giant].tapped).toBe(true);
  });
});

describe("Soul of Theros", () => {
  it("its graveyard ability exiles it and pumps your creatures", () => {
    const { game } = table();
    const soul = toGraveyard(game, "Soul of Theros");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 6);
    activate(game, soul, 1);
    expect(zone(game, soul)).toBe("exile");
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("first-strike")).toBe(true);
    expect(keywords(game, bears).has("lifelink")).toBe(true);
  });
});

describe("Kalonian Twingrove", () => {
  it("makes a Treefolk Warrior that counts your Forests too", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    lands(game, "Forest", 2, B);
    const grove = enter(game, "Kalonian Twingrove");
    const [token] = named(game, "Treefolk Warrior Token", A);
    expect(pt(game, grove)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, token)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Cogwork Grinder", () => {
  it("with nothing removed from a draft, enters with no counters and dies", () => {
    const { game } = table();
    lands(game, "Wastes", 6);
    const grinder = toHand(game, "Cogwork Grinder");
    cast(game, grinder);
    expect(zone(game, grinder)).toBe("graveyard");
  });
});
