/**
 * Dominaria, group B: the clause of each card most likely to be wrong.
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
  grant,
  hand,
  keywords,
  lands,
  life,
  named,
  pickModes,
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
  types,
  watchTargets,
  zone,
} from "./harness.js";

describe("Cast Down", () => {
  it("can't target a legendary creature", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const grunn = spawn(game, "Grunn, the Lonely King", B);
    lands(game, "Swamp", 2);
    const card = toHand(game, "Cast Down");
    expect(() => cast(game, card, { targets: [ref(grunn)] })).toThrow();
    cast(game, card, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Grunn, the Lonely King", () => {
  it("enters with five +1/+1 counters when kicked", () => {
    const { game } = table();
    lands(game, "Forest", 9);
    const grunn = toHand(game, "Grunn, the Lonely King");
    cast(game, grunn, { kicked: true });
    expect(counters(game, grunn)).toBe(5);
  });

  it("doubles its power and toughness attacking alone, not attacking with another", () => {
    const { game, a } = table();
    const grunn = spawn(game, "Grunn, the Lonely King");
    attack(game, a, [grunn]);
    expect(pt(game, grunn)).toEqual({ power: 10, toughness: 10 });

    const { game: game2, a: a2 } = table();
    const grunn2 = spawn(game2, "Grunn, the Lonely King");
    const bears = spawn(game2, "Grizzly Bears");
    attack(game2, a2, [grunn2, bears]);
    expect(pt(game2, grunn2)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Kwende, Pride of Femeref", () => {
  it("gives double strike to your creatures that gain first strike, and only yours", () => {
    const { game } = table();
    spawn(game, "Kwende, Pride of Femeref");
    const bears = spawn(game, "Grizzly Bears");
    const plain = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    grant(game, bears, "first-strike");
    grant(game, theirs, "first-strike");
    expect(keywords(game, bears).has("double-strike")).toBe(true);
    expect(keywords(game, plain).has("double-strike")).toBe(false);
    expect(keywords(game, theirs).has("double-strike")).toBe(false);
  });
});

describe("The Antiquities War", () => {
  it("III — your artifacts become 5/5 artifact creatures", () => {
    const { game } = table();
    const saga = spawn(game, "The Antiquities War");
    settle(game);
    game.state.objects[saga].counters.lore = 2;
    const ring = spawn(game, "Sol Ring");
    const theirs = spawn(game, "Sol Ring", B);
    toStep(game, "precombat-main");
    settle(game);
    expect(types(game, ring)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(pt(game, ring)).toEqual({ power: 5, toughness: 5 });
    expect(types(game, theirs)).not.toContain("creature");
  });
});

describe("Demonic Vigor", () => {
  it("returns the enchanted creature's card to its owner's hand when it dies", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Demonic Vigor"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    destroy(game, bears);
    expect(zone(game, bears)).toBe("hand");
  });
});

describe("Precognition Field", () => {
  it("casts an instant from the top of the library, but not a creature; {3} exiles the top card", () => {
    const { game } = table();
    const field = spawn(game, "Precognition Field");
    lands(game, "Mountain", 1);
    const bolt = toLibrary(game, "Lightning Bolt");
    game.dispatch({ type: "cast-spell", player: A, card: bolt, targets: [ref(B)], via: "library-top" });
    settle(game);
    expect(life(game, B)).toBe(17);

    lands(game, "Forest", 2);
    const bears = toLibrary(game, "Grizzly Bears");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: bears, targets: [], via: "library-top" })).not.toBeNull();

    lands(game, "Wastes", 3);
    activate(game, field, 0);
    expect(zone(game, bears)).toBe("exile");
  });
});

describe("Rite of Belzenlok", () => {
  it("I — two 0/1 Clerics; the Demon sacrifices another creature, or deals 6 to you", () => {
    const { game } = table();
    spawn(game, "Rite of Belzenlok");
    settle(game);
    expect(tokensNamed(game, "0/1 Black Cleric Token", A)).toBe(2);

    const { game: game2 } = table();
    const demon = spawn(game2, "6/6 Black Demon Token (Flying, Trample, Upkeep Sacrifice)");
    const bears = spawn(game2, "Grizzly Bears");
    toStep(game2, "upkeep");
    settle(game2);
    expect(zone(game2, bears)).toBe("graveyard");
    expect(zone(game2, demon)).toBe("battlefield");
    expect(life(game2, A)).toBe(20);
    toStep(game2, "upkeep");
    settle(game2);
    expect(zone(game2, demon)).toBe("battlefield");
    expect(life(game2, A)).toBe(14);
  });
});

describe("Triumph of Gerrard", () => {
  it("I — targets only a creature you control with the greatest power", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const maw = spawn(game, "Colossal Dreadmaw");
    const tied = spawn(game, "Colossal Dreadmaw");
    const theirs = spawn(game, "Colossal Dreadmaw", B);
    const seen = watchTargets(a, () => [maw]);
    spawn(game, "Triumph of Gerrard");
    settle(game);
    expect(seen.asked).toBe(1);
    expect([...seen.offered[0]].sort()).toEqual([maw, tied].sort());
    expect(seen.offered[0]).not.toContain(bears);
    expect(seen.offered[0]).not.toContain(theirs);
    expect(counters(game, maw)).toBe(1);
  });
});

describe("Knight of Malice", () => {
  it("gets +1/+0 while any player controls a white permanent", () => {
    const { game } = table();
    const knight = spawn(game, "Knight of Malice");
    expect(pt(game, knight)).toEqual({ power: 2, toughness: 2 });
    const lions = spawn(game, "Savannah Lions", B);
    expect(pt(game, knight)).toEqual({ power: 3, toughness: 2 });
    destroy(game, lions);
    expect(pt(game, knight)).toEqual({ power: 2, toughness: 2 });
    spawn(game, "Savannah Lions");
    expect(pt(game, knight)).toEqual({ power: 3, toughness: 2 });
  });
});

describe("Chandra's Outburst", () => {
  it("deals 4 to the target player, then searches (finding nothing here)", () => {
    const { game, a } = table();
    lands(game, "Mountain", 5);
    pickModes(a, 0);
    cast(game, toHand(game, "Chandra's Outburst"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(16);
  });
});

describe("Fight with Fire", () => {
  it("deals 5 to a creature unkicked; kicked, 10 divided among any targets", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const maw = spawn(game, "Colossal Dreadmaw", B);
    cast(game, toHand(game, "Fight with Fire"), { targets: [ref(maw)] });
    expect(zone(game, maw)).toBe("battlefield");
    expect(game.state.objects[maw].damageMarked).toBe(5);

    const { game: game2 } = table();
    lands(game2, "Mountain", 9);
    const maw2 = spawn(game2, "Colossal Dreadmaw", B);
    cast(game2, toHand(game2, "Fight with Fire"), { kicked: true, targets: [ref(B), ref(maw2)], division: [4, 6] });
    expect(life(game2, B)).toBe(16);
    expect(zone(game2, maw2)).toBe("graveyard");
  });
});

describe("Kazarov, Sengir Pureblood", () => {
  it("grows when a creature an opponent controls is dealt damage, not one of yours", () => {
    const { game } = table();
    const kazarov = spawn(game, "Kazarov, Sengir Pureblood");
    const theirs = spawn(game, "Colossal Dreadmaw", B);
    const mine = spawn(game, "Colossal Dreadmaw");
    lands(game, "Mountain", 8);
    activate(game, kazarov, 0, { targets: [ref(theirs)] });
    expect(counters(game, kazarov)).toBe(1);
    activate(game, kazarov, 0, { targets: [ref(mine)] });
    expect(counters(game, kazarov)).toBe(1);
  });
});

describe("Sentinel of the Pearl Trident", () => {
  it("may exile a historic permanent you control, which returns at the next end step", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring");
    const bears = spawn(game, "Grizzly Bears");
    const grunn = spawn(game, "Grunn, the Lonely King");
    const seen = watchTargets(a, () => [ring]);
    pickModes(a, 0);
    enter(game, "Sentinel of the Pearl Trident");
    expect(seen.offered[0]).toContain(ring);
    expect(seen.offered[0]).toContain(grunn);
    expect(seen.offered[0]).not.toContain(bears);
    expect(named(game, "Sol Ring", A)).toHaveLength(0);
    toStep(game, "end");
    settle(game);
    expect(named(game, "Sol Ring", A)).toHaveLength(1);
  });
});

describe("Bloodstone Goblin", () => {
  it("gets +1/+1 and menace when you cast a kicked spell, not an unkicked one", () => {
    const { game } = table();
    const goblin = spawn(game, "Bloodstone Goblin");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Into the Roil"), { targets: [ref(bears)] });
    expect(pt(game, goblin)).toEqual({ power: 2, toughness: 2 });

    const bears2 = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 4);
    cast(game, toHand(game, "Into the Roil"), { kicked: true, targets: [ref(bears2)] });
    expect(pt(game, goblin)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, goblin).has("menace")).toBe(true);
  });
});

describe("Lingering Phantom", () => {
  it("returns to hand for {B} when you cast a historic spell", () => {
    const { game, a } = table();
    const phantom = toGraveyard(game, "Lingering Phantom");
    lands(game, "Forest", 2);
    pickModes(a, 0);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(zone(game, phantom)).toBe("graveyard");

    lands(game, "Swamp", 2);
    const before = hand(game, A).length;
    cast(game, toHand(game, "Sol Ring"));
    expect(zone(game, phantom)).toBe("hand");
    expect(hand(game, A).length).toBe(before + 1);
  });
});
