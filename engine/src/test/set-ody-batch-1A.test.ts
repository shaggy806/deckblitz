/**
 * Odyssey (ODY; B225), group A. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  graveyard,
  hand,
  lands,
  life,
  pickModes,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

const battlefieldLands = (game: ReturnType<typeof table>["game"], player: typeof A): number =>
  game.battlefield.filter((id) => game.state.objects[id].controller === player && game.state.objects[id].cardName === "Wastes")
    .length;

describe("Kirtar's Wrath", () => {
  it("without threshold destroys every creature and makes no Spirits", () => {
    const { game } = table();
    lands(game, "Plains", 6);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Kirtar's Wrath"));
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, "Spirit Token", A)).toBe(0);
  });

  it("with threshold also makes two 1/1 flying Spirits", () => {
    const { game } = table();
    lands(game, "Plains", 6);
    for (let i = 0; i < 7; i++) toGraveyard(game, "Wastes");
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Kirtar's Wrath"));
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, "Spirit Token", A)).toBe(2);
  });
});

describe("New Frontiers", () => {
  it("each player who chooses to puts up to X basic lands onto the battlefield tapped", () => {
    const { game, a, b } = table();
    lands(game, "Forest", 3);
    pickModes(a, 0);
    pickModes(b, 0);
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 2);
    b.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 2);
    const beforeA = battlefieldLands(game, A);
    cast(game, toHand(game, "New Frontiers"), { x: 2 });
    expect(battlefieldLands(game, A)).toBe(beforeA + 2);
    expect(battlefieldLands(game, B)).toBe(2);
  });
});

describe("Blazing Salvo", () => {
  it("the creature's controller may take 5 to spare it", () => {
    const { game, b } = table();
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(b, 0);
    cast(game, toHand(game, "Blazing Salvo"), { targets: [ref(bears)] });
    expect(life(game, B)).toBe(15);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("aimed at its caster's own creature, the caster takes the 5 when they choose to", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    cast(game, toHand(game, "Blazing Salvo"), { targets: [ref(bears)] });
    expect(life(game, A)).toBe(15);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Lava Blister", () => {
  it("the land's controller may take 6 to keep it, or let it be destroyed", () => {
    const { game, b } = table();
    lands(game, "Mountain", 4);
    const [kept, lost] = lands(game, "Centaur Garden", 2, B);
    pickModes(b, 0);
    cast(game, toHand(game, "Lava Blister"), { targets: [ref(kept)] });
    expect(life(game, B)).toBe(14);
    expect(zone(game, kept)).toBe("battlefield");
    pickModes(b, 1);
    cast(game, toHand(game, "Lava Blister"), { targets: [ref(lost)] });
    expect(life(game, B)).toBe(14);
    expect(zone(game, lost)).toBe("graveyard");
  });
});

describe("Molten Influence", () => {
  it("the spell's controller may take 4 to keep the spell", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    pickModes(a, 0);
    cast(game, toHand(game, "Molten Influence"), { targets: [ref(bolt)] });
    expect(life(game, A)).toBe(16);
    expect(life(game, B)).toBe(17);
  });

  it("or let it be countered", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    pickModes(a, 1);
    cast(game, toHand(game, "Molten Influence"), { targets: [ref(bolt)] });
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(20);
    expect(zone(game, bolt)).toBe("graveyard");
  });
});

describe("Gorilla Titan", () => {
  it("is 8/8 only while its controller's graveyard is empty", () => {
    const { game } = table();
    const titan = spawn(game, "Gorilla Titan");
    expect(pt(game, titan)).toEqual({ power: 8, toughness: 8 });
    toGraveyard(game, "Wastes", B);
    expect(pt(game, titan)).toEqual({ power: 8, toughness: 8 });
    toGraveyard(game, "Wastes");
    expect(pt(game, titan)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Centaur Garden", () => {
  it("its pump can be activated only with threshold", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const garden = spawn(game, "Centaur Garden");
    const bears = spawn(game, "Grizzly Bears");
    expect(() => activate(game, garden, 1, { targets: [ref(bears)] })).toThrow();
    for (let i = 0; i < 7; i++) toGraveyard(game, "Wastes");
    activate(game, garden, 1, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(zone(game, garden)).toBe("graveyard");
  });
});

describe("Sarcatog", () => {
  it("exiles two graveyard cards for +1/+1", () => {
    const { game } = table();
    const tog = spawn(game, "Sarcatog");
    toGraveyard(game, "Wastes");
    toGraveyard(game, "Wastes");
    activate(game, tog, 0);
    expect(graveyard(game, A).length).toBe(0);
    expect(pt(game, tog)).toEqual({ power: 2, toughness: 3 });
  });
});

describe("Aboshan, Cephalid Emperor", () => {
  it("taps every creature without flying, and only those", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const aboshan = spawn(game, "Aboshan, Cephalid Emperor");
    const bears = spawn(game, "Grizzly Bears", B);
    const bird = spawn(game, "Birds of Paradise", B);
    activate(game, aboshan, 1);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(game.state.objects[aboshan].tapped).toBe(true);
    expect(game.state.objects[bird].tapped).toBe(false);
  });

  it("taps itself to tap a target permanent", () => {
    const { game } = table();
    const aboshan = spawn(game, "Aboshan, Cephalid Emperor", A, { sick: true });
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, aboshan, 0, { targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(game.state.objects[aboshan].tapped).toBe(true);
  });
});

describe("Animal Boneyard", () => {
  it("gives the land a sacrifice outlet that gains the creature's toughness", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const land = spawn(game, "Wastes");
    const giant = spawn(game, "Hill Giant");
    cast(game, toHand(game, "Animal Boneyard"), { targets: [ref(land)] });
    game.state.objects[land].tapped = false;
    game.dispatch({ type: "activate-ability", player: A, source: land, abilityIndex: 1, targets: [], sacrifice: giant } as never);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, A)).toBe(23);
  });
});

describe("Pedantic Learning", () => {
  it("pays {1} to draw for a land milled from its controller's library", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    spawn(game, "Pedantic Learning");
    const adept = spawn(game, "Cathartic Adept");
    pickModes(a, 0);
    const before = hand(game, A).length;
    activate(game, adept, 0, { targets: [ref(A)] });
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("ignores a land milled from an opponent's library", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    spawn(game, "Pedantic Learning");
    const adept = spawn(game, "Cathartic Adept");
    pickModes(a, 0);
    const before = hand(game, A).length;
    activate(game, adept, 0, { targets: [ref(B)] });
    expect(hand(game, A).length).toBe(before);
  });
});

describe("Dwarven Recruiter", () => {
  it("puts the Dwarves found on top of the library", () => {
    const { game, a } = table();
    const dwarf = toLibrary(game, "Dwarven Scorcher");
    a.chooseFromZoneFn = (_view, eligible) => eligible;
    game.debugSpawn("Dwarven Recruiter", A, "battlefield", { announceEntry: true, summoningSick: false });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(game.state.zones.perPlayer[A].library[0]).toBe(dwarf);
  });
});
