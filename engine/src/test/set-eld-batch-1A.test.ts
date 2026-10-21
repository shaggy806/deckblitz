/**
 * Throne of Eldraine, batch 1, group A — and Intruder Alarm, unblocked by
 * the "doesn't untap" restriction on other permanents.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  counters,
  enter,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Giant Opportunity", () => {
  it("sacrifices two Foods for a 7/7 Giant", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const foods = [spawn(game, "Food Token"), spawn(game, "Food Token")];
    pickModes(a, 0);
    cast(game, toHand(game, "Giant Opportunity"));
    expect(tokensNamed(game, "Giant Token", A)).toBe(1);
    expect(tokensNamed(game, "Food Token", A)).toBe(0);
    for (const food of foods) expect(game.state.objects[food]?.zone ?? "gone").not.toBe("battlefield");
  });

  it("makes three Foods when declined", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const foods = [spawn(game, "Food Token"), spawn(game, "Food Token")];
    pickModes(a);
    cast(game, toHand(game, "Giant Opportunity"));
    expect(tokensNamed(game, "Giant Token", A)).toBe(0);
    expect(tokensNamed(game, "Food Token", A)).toBe(3);
    for (const food of foods) expect(zone(game, food)).toBe("battlefield");
  });

  it("with only one Food, can't sacrifice and makes three Foods", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const food = spawn(game, "Food Token");
    pickModes(a, 0);
    cast(game, toHand(game, "Giant Opportunity"));
    expect(tokensNamed(game, "Giant Token", A)).toBe(0);
    expect(tokensNamed(game, "Food Token", A)).toBe(3);
    expect(zone(game, food)).toBe("battlefield");
  });
});

describe("The Royal Scions", () => {
  it("−8 draws four, then deals damage equal to the cards in hand", () => {
    const { game, a } = table();
    const scions = spawn(game, "The Royal Scions");
    const before = hand(game).length;
    pickTargets(a, B);
    loyalty(game, scions, -8, { atLeast: 8 });
    expect(hand(game).length).toBe(before + 4);
    expect(life(game, B)).toBe(20 - (before + 4));
  });
});

describe("Mysterious Pathlighter", () => {
  it("gives a creature with an Adventure an extra +1/+1 counter, and nothing else", () => {
    const { game } = table();
    spawn(game, "Mysterious Pathlighter");
    lands(game, "Plains", 2);
    lands(game, "Forest", 2);
    const shepherd = toHand(game, "Shepherd of the Flock");
    cast(game, shepherd);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(counters(game, shepherd)).toBe(1);
    expect(counters(game, bears)).toBe(0);
  });
});

describe("Intruder Alarm", () => {
  it("stops creatures untapping, not lands; a creature entering untaps every creature", () => {
    const { game } = table();
    spawn(game, "Intruder Alarm");
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    const theirs = spawn(game, "Grizzly Bears", B, { tapped: true });
    const forest = spawn(game, "Forest", A, { tapped: true });
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "precombat-main" && s.priority.holder === A);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(game.state.objects[theirs].tapped).toBe(true);
    expect(game.state.objects[forest].tapped).toBe(false);
    enter(game, "Savannah Lions");
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(game.state.objects[theirs].tapped).toBe(false);
  });
});

describe("Blow Your House Down", () => {
  it("destroys the Walls among its targets and leaves the rest unable to block", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const wall = spawn(game, "Wall of Wood", B);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Blow Your House Down"), { targets: [ref(wall), ref(bears), null] });
    expect(zone(game, wall)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Redcap Melee", () => {
  it("makes you sacrifice a land only when a nonred permanent is dealt damage", () => {
    const { game } = table();
    const [mountain] = lands(game, "Mountain", 2);
    const goblin = spawn(game, "Raging Goblin", B);
    cast(game, toHand(game, "Redcap Melee"), { targets: [ref(goblin)] });
    expect(zone(game, goblin)).toBe("graveyard");
    expect(zone(game, mountain)).toBe("battlefield");
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Redcap Melee"), { targets: [ref(bears)] });
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Mountain")).toHaveLength(1);
  });
});

describe("Joust", () => {
  it("pumps a Knight +2/+1, then the two fight", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const knight = spawn(game, "White Knight");
    const lions = spawn(game, "Savannah Lions", B);
    cast(game, toHand(game, "Joust"), { targets: [ref(knight), ref(lions)] });
    expect(zone(game, lions)).toBe("graveyard");
    expect(zone(game, knight)).toBe("battlefield");
    expect(pt(game, knight)).toEqual({ power: 4, toughness: 3 });
  });
});

describe("Mace of the Valiant", () => {
  it("counts a charge counter per creature entering, and gives the equipped creature +1/+1 per counter and vigilance", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const mace = spawn(game, "Mace of the Valiant");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, mace, 0, { targets: [ref(bears)] });
    expect(keywords(game, bears).has("vigilance")).toBe(true);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    enter(game, "Savannah Lions");
    enter(game, "Savannah Lions", B);
    expect(counters(game, mace, "charge")).toBe(1);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Witch's Vengeance", () => {
  it("gives -3/-3 to creatures of the chosen type only", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const lions = spawn(game, "Savannah Lions", B);
    a.chooseCreatureTypeFn = () => "Bear";
    cast(game, toHand(game, "Witch's Vengeance"));
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, lions)).toBe("battlefield");
  });
});

describe("Wicked Wolf", () => {
  it("sacrificing a Food gives it a counter and indestructible, and taps it", () => {
    const { game } = table();
    const wolf = spawn(game, "Wicked Wolf");
    const food = spawn(game, "Food Token");
    game.dispatch({ type: "activate-ability", player: A, source: wolf, abilityIndex: 0, targets: [], sacrifice: food });
    settle(game);
    expect(counters(game, wolf)).toBe(1);
    expect(keywords(game, wolf).has("indestructible")).toBe(true);
    expect(game.state.objects[wolf].tapped).toBe(true);
    expect(zone(game, food)).not.toBe("battlefield");
  });
});
