/**
 * Future Sight (FUT; B195) — group B: granted abilities, grandeur, vanishing
 * and activation restrictions.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  hand,
  lands,
  named,
  pickFromZone,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Sporoloth Ancient", () => {
  it("gives another creature its own remove-two-spore-counters ability", () => {
    const { game } = table();
    spawn(game, "Sporoloth Ancient");
    const bears = spawn(game, "Grizzly Bears");
    expect(() => activate(game, bears, 0)).toThrow();
    game.state.objects[bears].counters.spore = 2;
    activate(game, bears, 0);
    expect(counters(game, bears, "spore")).toBe(0);
    expect(tokensNamed(game, "Saproling Token", A)).toBe(1);
  });
});

describe("Lost Auramancers", () => {
  it("dying with no time counters searches for an enchantment", () => {
    const { game, a } = table();
    const anthem = toLibrary(game, "Glorious Anthem");
    const mancers = enter(game, "Lost Auramancers");
    expect(counters(game, mancers, "time")).toBe(3);
    pickFromZone(a, anthem);
    pickModes(a, 0);
    // The last time counter removed: vanishing sacrifices it, counterless.
    game.debugApplyEffect(A, { kind: "remove-counter", target: 0, counter: "time", amount: 3 }, [ref(mancers)]);
    settle(game);
    expect(zone(game, mancers)).toBe("graveyard");
    expect(zone(game, anthem)).toBe("battlefield");
  });

  it("dying with time counters on it doesn't", () => {
    const { game, a } = table();
    const anthem = toLibrary(game, "Glorious Anthem");
    const mancers = enter(game, "Lost Auramancers");
    pickFromZone(a, anthem);
    pickModes(a, 0);
    destroy(game, mancers);
    expect(zone(game, mancers)).toBe("graveyard");
    expect(zone(game, anthem)).toBe("library");
  });
});

describe("Korlash, Heir to Blackblade", () => {
  it("is as big as your Swamps; grandeur fetches two tapped Swamps", () => {
    const { game, a } = table();
    const korlash = spawn(game, "Korlash, Heir to Blackblade");
    lands(game, "Swamp", 2);
    expect(pt(game, korlash)).toEqual({ power: 2, toughness: 2 });
    expect(() => activate(game, korlash, 1)).toThrow();
    const other = toHand(game, "Korlash, Heir to Blackblade");
    const s1 = toLibrary(game, "Swamp");
    const s2 = toLibrary(game, "Swamp");
    pickFromZone(a, s1, s2);
    activate(game, korlash, 1);
    expect(zone(game, other)).toBe("graveyard");
    expect([zone(game, s1), zone(game, s2)]).toEqual(["battlefield", "battlefield"]);
    expect(game.state.objects[s1].tapped).toBe(true);
    expect(pt(game, korlash)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Tarox Bladewing", () => {
  it("grandeur doubles its power until end of turn", () => {
    const { game } = table();
    const tarox = spawn(game, "Tarox Bladewing");
    toHand(game, "Tarox Bladewing");
    activate(game, tarox, 0);
    expect(pt(game, tarox)).toEqual({ power: 8, toughness: 7 });
  });
});

describe("Augur of Skulls", () => {
  it("can be sacrificed only during your upkeep", () => {
    const { game } = table();
    const augur = spawn(game, "Augur of Skulls");
    expect(() => activate(game, augur, 1, { targets: [ref(B)] })).toThrow();
    toStep(game, "upkeep");
    const before = hand(game, B).length;
    activate(game, augur, 1, { targets: [ref(B)] });
    expect(zone(game, augur)).toBe("graveyard");
    expect(hand(game, B).length).toBe(before - 2);
  });
});

describe("Bloodshot Trainee", () => {
  it("activates only with power 4 or greater", () => {
    const { game } = table();
    const trainee = spawn(game, "Bloodshot Trainee");
    const target = spawn(game, "Grizzly Bears", B);
    expect(() => activate(game, trainee, 0, { targets: [ref(target)] })).toThrow();
    spawn(game, "Glorious Anthem");
    spawn(game, "Glorious Anthem");
    activate(game, trainee, 0, { targets: [ref(target)] });
    expect(zone(game, target)).toBe("graveyard");
  });
});

describe("Snake Cult Initiation", () => {
  it("enchanted creature gives three poison counters on combat damage", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Snake Cult Initiation"), { targets: [ref(bears)] });
    attack(game, a, [bears]);
    expect(game.state.players[B].counters?.poison ?? 0).toBe(3);
  });
});

describe("Scourge of Kher Ridges", () => {
  it("{5}{R} deals 6 to each other flier, sparing itself and ground creatures", () => {
    const { game } = table();
    const scourge = spawn(game, "Scourge of Kher Ridges");
    const flier = spawn(game, "Serra Angel", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 6);
    activate(game, scourge, 1);
    expect(zone(game, flier)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, scourge)).toBe("battlefield");
  });
});

describe("Maelstrom Djinn", () => {
  it("turned face up, gets two time counters and vanishing", () => {
    const { game } = table();
    lands(game, "Island", 6);
    const djinn = toHand(game, "Maelstrom Djinn");
    cast(game, djinn, { via: "face-down" });
    game.dispatch({ type: "turn-face-up", player: A, permanent: djinn, morph: true } as Action);
    settle(game);
    expect(counters(game, djinn, "time")).toBe(2);
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, djinn, "time")).toBe(1);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, djinn)).toBe("graveyard");
  });
});

describe("Baru, Fist of Krosa", () => {
  it("pumps your green creatures when any Forest enters", () => {
    const { game } = table();
    spawn(game, "Baru, Fist of Krosa");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    enter(game, "Forest", B);
    settle(game);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });

  it("grandeur makes an X/X Wurm, X your lands", () => {
    const { game } = table();
    const baru = spawn(game, "Baru, Fist of Krosa");
    lands(game, "Forest", 3);
    expect(() => activate(game, baru, 0)).toThrow();
    const other = toHand(game, "Baru, Fist of Krosa");
    activate(game, baru, 0);
    expect(zone(game, other)).toBe("graveyard");
    expect(tokensNamed(game, "Wurm Token (Baru, Fist of Krosa)")).toBe(1);
    const [wurm] = named(game, "Wurm Token (Baru, Fist of Krosa)");
    expect(pt(game, wurm!)).toEqual({ power: 3, toughness: 3 });
  });
});
