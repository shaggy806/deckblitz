/**
 * Dissension (DIS; B201) — group C: the spent-mana Herald, the hellbent Dragon,
 * graft, Momir Vig's cast triggers, a damage redirection and an enters-sacrifice.
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
  pickModes,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

describe("Azorius Herald", () => {
  it("stays when {U} was spent to cast it", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    lands(game, "Wastes", 1);
    const herald = toHand(game, "Azorius Herald");
    cast(game, herald);
    expect(zone(game, herald)).toBe("battlefield");
    expect(life(game, A)).toBe(24);
  });

  it("is sacrificed when no {U} was spent", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const herald = toHand(game, "Azorius Herald");
    cast(game, herald);
    expect(zone(game, herald)).toBe("graveyard");
    expect(life(game, A)).toBe(24);
  });

  it("is sacrificed when it enters without being cast", () => {
    const { game } = table();
    const herald = enter(game, "Azorius Herald");
    expect(zone(game, herald)).toBe("graveyard");
  });
});

describe("Flame-Kin War Scout", () => {
  it("is sacrificed when another creature enters and deals 4 damage to it", () => {
    const { game } = table();
    const scout = spawn(game, "Flame-Kin War Scout");
    const bears = enter(game, "Grizzly Bears", B);
    expect(zone(game, scout)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Carom", () => {
  it("redirects the next 1 damage to the second creature and draws a card", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const elves = spawn(game, "Llanowar Elves", B);
    lands(game, "Plains", 2);
    lands(game, "Mountain", 1);
    const carom = toHand(game, "Carom");
    const before = hand(game, A).length;
    cast(game, carom, { targets: [ref(bears), ref(elves)] });
    expect(hand(game, A).length).toBe(before); // Carom left, a card came in
    cast(game, toHand(game, "Shock"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield"); // took 1 of Shock's 2
    expect(zone(game, elves)).toBe("graveyard"); // took the redirected 1
  });
});

describe("Momir Vig, Simic Visionary", () => {
  it("a blue creature spell reveals the top card and takes it if it's a creature", () => {
    const { game } = table();
    spawn(game, "Momir Vig, Simic Visionary");
    const bears = toLibrary(game, "Grizzly Bears");
    lands(game, "Island", 3);
    cast(game, toHand(game, "Phantom Warrior"));
    expect(zone(game, bears)).toBe("hand");
  });

  it("a noncreature on top stays there", () => {
    const { game } = table();
    spawn(game, "Momir Vig, Simic Visionary");
    const top = toLibrary(game, "Wastes");
    lands(game, "Island", 3);
    cast(game, toHand(game, "Phantom Warrior"));
    expect(zone(game, top)).toBe("library");
  });
});

describe("Verdant Eidolon", () => {
  it("returns from the graveyard when you cast a multicolored spell", () => {
    const { game, a } = table();
    const eidolon = toGraveyard(game, "Verdant Eidolon");
    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    lands(game, "Wastes", 3);
    pickModes(a, 0);
    cast(game, toHand(game, "Momir Vig, Simic Visionary"));
    expect(zone(game, eidolon)).toBe("hand");
  });
});

describe("Cytoplast Root-Kin", () => {
  it("adds a counter to each other creature you control with one, and moves one back for {2}", () => {
    const { game, a } = table();
    pickModes(a); // decline every graft move
    const initiate = enter(game, "Simic Initiate");
    const bears = spawn(game, "Grizzly Bears");
    const root = enter(game, "Cytoplast Root-Kin");
    expect(counters(game, root)).toBe(4);
    expect(counters(game, initiate)).toBe(2);
    expect(counters(game, bears)).toBe(0);
    lands(game, "Wastes", 2);
    activate(game, root, 0, { targets: [ref(initiate)] });
    expect(counters(game, root)).toBe(5);
    expect(counters(game, initiate)).toBe(1);
  });
});

describe("Rakdos Pit Dragon", () => {
  it("has double strike only while its controller's hand is empty", () => {
    const { game } = table();
    const dragon = spawn(game, "Rakdos Pit Dragon");
    expect(keywords(game, dragon).has("double-strike")).toBe(false);
    game.debugApplyEffect(A, { kind: "discard-hand", who: "you" }, []);
    expect(keywords(game, dragon).has("double-strike")).toBe(true);
  });
});

describe("Guardian of the Guildpact", () => {
  it("can't be targeted by a monocolored spell", () => {
    const { game } = table();
    const guardian = spawn(game, "Guardian of the Guildpact", B);
    lands(game, "Mountain", 1);
    const shock = toHand(game, "Shock");
    expect(() => cast(game, shock, { targets: [ref(guardian)] })).toThrow();
    cast(game, shock, { targets: [ref(B)] }); // the same Shock is castable otherwise
    expect(life(game, B)).toBe(18);
  });
});

describe("Nettling Curse", () => {
  it("enchanted creature's controller loses 3 life when it attacks", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Nettling Curse"), { targets: [ref(bears)] });
    attack(game, a, [bears]);
    expect(life(game, A)).toBe(17);
    expect(life(game, B)).toBe(18);
  });
});
