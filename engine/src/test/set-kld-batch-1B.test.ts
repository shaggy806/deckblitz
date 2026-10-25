/**
 * Kaladesh and Commander 2016, group B: the cards whose behaviour is more
 * than a stat line or a copy of an already-tested shape.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  enter,
  hand,
  keywords,
  lands,
  life,
  named,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Kaladesh — group B", () => {
  it("Era of Innovation pays {1} for {E}{E} when an artifact enters, and trades six energy for three cards", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    const era = spawn(game, "Era of Innovation");
    pickModes(a, 0);
    enter(game, "Sol Ring");
    expect(game.state.players[A].energy).toBe(2);
    game.state.players[A].energy = 6;
    const before = hand(game).length;
    activate(game, era);
    expect(game.state.players[A].energy).toBe(0);
    expect(hand(game).length).toBe(before + 3);
    expect(zone(game, era)).toBe("graveyard");
  });

  it("Insidious Will copies an instant", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Island", 4);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    cast(game, toHand(game, "Insidious Will"), { modes: [2], targets: [ref(bolt)] });
    expect(life(game, B)).toBe(14);
  });

  it("Insidious Will counters a spell", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Island", 4);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    cast(game, toHand(game, "Insidious Will"), { modes: [0], targets: [ref(bolt)] });
    expect(life(game, B)).toBe(20);
    expect(zone(game, bolt)).toBe("graveyard");
  });

  it("Parting Thoughts draws and loses life for every counter of every kind", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    game.state.objects[bears].counters["+1/+1"] = 2;
    game.state.objects[bears].counters["stun"] = 1;
    const card = toHand(game, "Parting Thoughts");
    const before = hand(game).length;
    cast(game, card, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game).length).toBe(before - 1 + 3);
    expect(life(game)).toBe(17);
  });

  it("Underhanded Designs drains on an artifact entering, and destroys only with two artifacts", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const designs = spawn(game, "Underhanded Designs");
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    enter(game, "Sol Ring");
    expect(life(game, B)).toBe(19);
    expect(life(game)).toBe(21);
    expect(() => activate(game, designs, 0, { targets: [ref(bears)] })).toThrow();
    spawn(game, "Sol Ring");
    activate(game, designs, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("Lathnu Hellion stays for {E}{E} and is sacrificed without it", () => {
    const { game, a } = table();
    const hellion = enter(game, "Lathnu Hellion");
    expect(game.state.players[A].energy).toBe(2);
    pickModes(a, 0);
    toStep(game, "end");
    settle(game);
    expect(zone(game, hellion)).toBe("battlefield");
    expect(game.state.players[A].energy).toBe(0);
    toStep(game, "end");
    settle(game);
    expect(zone(game, hellion)).toBe("graveyard");
  });

  it("Oviya Pashiri makes an X/X Construct for the creatures you control", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    spawn(game, "Grizzly Bears");
    const oviya = spawn(game, "Oviya Pashiri, Sage Lifecrafter");
    activate(game, oviya, 1);
    const [construct] = named(game, "Construct Token (Metallurgic Summonings)", A);
    expect(construct).toBeDefined();
    expect(pt(game, construct)).toEqual({ power: 2, toughness: 2 });
  });

  it("Architect of the Untamed gets energy on landfall and spends eight for a 6/6 Beast", () => {
    const { game } = table();
    const architect = spawn(game, "Architect of the Untamed");
    enter(game, "Forest");
    expect(game.state.players[A].energy).toBe(1);
    game.state.players[A].energy = 8;
    activate(game, architect);
    expect(tokensNamed(game, "6/6 Beast Artifact Token", A)).toBe(1);
    expect(game.state.players[A].energy).toBe(0);
  });

  it("Maulfist Doorbuster pays {E} on attack to stop a blocker", () => {
    const { game, a } = table();
    const doorbuster = spawn(game, "Maulfist Doorbuster");
    const bears = spawn(game, "Grizzly Bears", B);
    game.state.players[A].energy = 1;
    pickTargets(a, bears);
    pickModes(a, 0);
    attack(game, a, [doorbuster]);
    expect(game.state.players[A].energy).toBe(0);
    expect(life(game, B)).toBe(16);
  });

  it("Built to Last makes only an artifact creature indestructible", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    const golem = spawn(game, "Ornithopter");
    cast(game, toHand(game, "Built to Last"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("indestructible")).toBe(false);
    cast(game, toHand(game, "Built to Last"), { targets: [ref(golem)] });
    expect(keywords(game, golem).has("indestructible")).toBe(true);
  });

  it("Renegade Firebrand gets +1/+0 and first strike with a Chandra", () => {
    const { game } = table();
    const firebrand = spawn(game, "Renegade Firebrand");
    expect(pt(game, firebrand)).toEqual({ power: 3, toughness: 2 });
    spawn(game, "Chandra, Torch of Defiance");
    expect(pt(game, firebrand)).toEqual({ power: 4, toughness: 2 });
    expect(keywords(game, firebrand).has("first-strike")).toBe(true);
  });
});
