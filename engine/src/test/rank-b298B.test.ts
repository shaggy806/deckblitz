/**
 * Batch B298, group B: blocked cards re-attempted by rank. Each test checks
 * the clause the card's old triage record said the engine couldn't run.
 */
import { describe, expect, it } from "vitest";

import { effectiveColors, invalidateComputedCache } from "../characteristics.js";
import type { ObjectId } from "../primitives.js";
import { printedCardName } from "../state.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  lands,
  life,
  named,
  nextTurn,
  pickFromZone,

  pickTargets,
  pt,
  ref,
  registryOf,
  spawn,
  table,
  toExile,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

describe("B298 group B", () => {
  it("The Celestus: its ability turns day to night, and the change gains 1 life", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const celestus = enter(game, "The Celestus");
    expect(game.state.dayNight).toBe("day");
    const before = life(game, A);
    activate(game, celestus, 1);
    expect(game.state.dayNight).toBe("night");
    expect(life(game, A)).toBe(before + 1);
  });

  it("Hancock: other Zombies and Mutants get +X/+X for every counter of any kind on Hancock", () => {
    const { game } = table();
    const hancock = spawn(game, "Hancock, Ghoulish Mayor");
    const zombie = spawn(game, "Walking Corpse");
    const bear = spawn(game, "Grizzly Bears");
    game.state.objects[hancock].counters["+1/+1"] = 1;
    game.state.objects[hancock].counters.charge = 1;
    invalidateComputedCache();
    expect(pt(game, zombie)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, bear)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, hancock)).toEqual({ power: 3, toughness: 2 });
  });

  it("Mizzix: an experience counter only for a spell whose mana value exceeds the count, and the discount per counter", () => {
    const { game } = table();
    spawn(game, "Mizzix of the Izmagnus");
    lands(game, "Island", 4);
    cast(game, toHand(game, "Opt"));
    expect(game.state.players[A].counters.experience).toBe(1);
    cast(game, toHand(game, "Opt"));
    expect(game.state.players[A].counters.experience).toBe(1);
    // Divination ({2}{U}) costs {1}{U} with one counter: two Islands are left.
    cast(game, toHand(game, "Divination"));
    expect(game.state.players[A].counters.experience).toBe(2);
  });

  it("Epic Experiment: the exiled cards not cast are put into the graveyard", () => {
    const { game } = table();
    lands(game, "Island", 2);
    lands(game, "Mountain", 2);
    const bears = toLibrary(game, "Grizzly Bears");
    const opt = toLibrary(game, "Opt");
    cast(game, toHand(game, "Epic Experiment"), { x: 2 });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, opt)).toBe("graveyard");
  });

  it("Slime Against Humanity: counts the Oozes and namesakes you own in exile as well as the graveyard", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    toGraveyard(game, "Slime Against Humanity");
    toExile(game, "Slime Against Humanity");
    toExile(game, "Slime Against Humanity", B);
    cast(game, toHand(game, "Slime Against Humanity"));
    const [ooze] = named(game, "0/0 Trample Ooze Token", A);
    expect(counters(game, ooze)).toBe(4);
  });

  it("Painter's Servant: cards outside the battlefield and permanents are the chosen color too", () => {
    const { game } = table();
    const bolt = toHand(game, "Lightning Bolt", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const servant = spawn(game, "Painter's Servant");
    game.state.objects[servant].chosenOnEnter = "U";
    invalidateComputedCache();
    const colors = (id: ObjectId): string[] =>
      [...effectiveColors(game.state, registryOf(game), game.state.objects[id])].sort();
    expect(colors(bolt)).toEqual(["R", "U"]);
    expect(colors(bears)).toEqual(["G", "U"]);
    expect(colors(servant)).toEqual(["U"]);
  });

  it("Sigurd: the boast puts a lore counter on the Saga, and that triggers a +1/+1 counter", () => {
    const { game, a } = table();
    const sigurd = spawn(game, "Sigurd, Jarl of Ravensthorpe");
    const saga = spawn(game, "The Eldest Reborn");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 1);
    attack(game, a, [sigurd]);
    pickTargets(a, bears);
    const lore = counters(game, saga, "lore");
    const had = counters(game, bears);
    activate(game, sigurd, 0, { targets: [ref(saga)] });
    expect(counters(game, saga, "lore")).toBe(lore + 1);
    expect(counters(game, bears)).toBe(had + 1);
  });

  it("Endless Detour: a card in a graveyard is a legal target, put into its owner's library", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    const card = toGraveyard(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Endless Detour"), { targets: [ref(card)] });
    expect(zone(game, card)).toBe("library");
  });

  it("Kethis: a legendary land in the graveyard may be played from there this turn", () => {
    const { game, a } = table();
    const kethis = spawn(game, "Kethis, the Hidden Hand");
    const one = toGraveyard(game, "Isamaru, Hound of Konda");
    const two = toGraveyard(game, "Thalia, Guardian of Thraben");
    const cradle = toGraveyard(game, "Gaea's Cradle");
    pickFromZone(a, one, two);
    activate(game, kethis, 0);
    expect(zone(game, one)).toBe("exile");
    expect(game.legalActions(A).some((l) => l.kind === "play-land" && l.card === cradle)).toBe(true);
  });

  it("Radagast: only a creature card sharing no creature type with your creatures is offered", () => {
    const { game, a } = table();
    spawn(game, "Radagast the Brown");
    const runeclaw = toLibrary(game, "Runeclaw Bear");
    const elves = toLibrary(game, "Llanowar Elves");
    spawn(game, "Grizzly Bears");
    const seen = pickFromZone(a, elves);
    enter(game, "Grizzly Bears");
    expect(seen.offered).toContain(elves);
    expect(seen.offered).not.toContain(runeclaw);
    expect(zone(game, elves)).toBe("hand");
  });

  it("Rem Karolus: a spell's damage to your side is prevented, and to an opponent's is plus 1", () => {
    const { game } = table();
    spawn(game, "Rem Karolus, Stalwart Slayer");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    cast(game, toHand(game, "Shock"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].damageMarked).toBe(0);
  });

  it("Arthur: attacking with another creature puts a creature card in attacking, back to hand at end of combat", () => {
    const { game, a } = table();
    const arthur = spawn(game, "Arthur, Marigold Knight");
    const bears = spawn(game, "Grizzly Bears");
    const guide = toLibrary(game, "Goblin Guide");
    pickFromZone(a, guide);
    attack(game, a, [arthur, bears]);
    expect(life(game, B)).toBe(20 - 4 - 2 - 2);
    expect(zone(game, guide)).toBe("hand");
  });

  it("Arthur: attacking alone doesn't trigger", () => {
    const { game, a } = table();
    const arthur = spawn(game, "Arthur, Marigold Knight");
    const guide = toLibrary(game, "Goblin Guide");
    attack(game, a, [arthur]);
    expect(zone(game, guide)).toBe("library");
  });

  it("Jacob Frye: a card with freerunning in your graveyard is a legal target", () => {
    const { game, a } = table();
    const jacob = spawn(game, "Jacob Frye");
    const vision = toGraveyard(game, "Eagle Vision");
    const bears = toGraveyard(game, "Grizzly Bears");
    const seen = watchTargets(a, () => [vision]);
    attack(game, a, [jacob]);
    expect(seen.offered[0]).toContain(vision);
    expect(seen.offered[0]).not.toContain(bears);
    expect(zone(game, vision)).toBe("exile");
  });

  it("Tamiyo: an opponent's spell can't make you discard", () => {
    const { game } = table();
    spawn(game, "Tamiyo, Collector of Tales");
    lands(game, "Swamp", 3, B);
    const rot = toHand(game, "Mind Rot", B);
    nextTurn(game);
    const before = hand(game, A).length;
    cast(game, rot, { player: B, targets: [ref(A)] });
    expect(hand(game, A).length).toBe(before);
  });

  it("Game Over: costs {2} less while an opponent is at half their starting life", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    game.state.players[B].life = 10;
    const card = toHand(game, "Game Over");
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, card);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("Twisted Sewer-Witch: a Wicked Role for each Rat you control", () => {
    const { game } = table();
    spawn(game, "Rat Token");
    enter(game, "Twisted Sewer-Witch");
    expect(tokensNamed(game, "Wicked Role Token", A)).toBe(2);
  });

  it("Technomancer: any number of artifact creature cards with total mana value 6 or less", () => {
    const { game, a } = table();
    const solemn = toGraveyard(game, "Solemn Simulacrum");
    const overseer = toGraveyard(game, "Steel Overseer");
    const thopter = toGraveyard(game, "Ornithopter");
    const seen = pickFromZone(a, solemn, thopter);
    enter(game, "Technomancer");
    expect(seen.offered).toEqual(expect.arrayContaining([solemn, overseer, thopter]));
    expect(zone(game, solemn)).toBe("battlefield");
    expect(zone(game, thopter)).toBe("battlefield");
    expect(zone(game, overseer)).toBe("graveyard");
  });

  it("Niv-Mizzet Reborn: one card for each color pair present, the rest to the bottom", () => {
    const { game } = table();
    const opt = toLibrary(game, "Opt");
    const charm = toLibrary(game, "Azorius Charm");
    const helix = toLibrary(game, "Lightning Helix");
    const dimir = toLibrary(game, "Dimir Charm");
    enter(game, "Niv-Mizzet Reborn");
    for (const id of [charm, helix, dimir]) expect(zone(game, id)).toBe("hand");
    expect(zone(game, opt)).toBe("library");
  });

  it("Rakdos: Demons are spared, and each other creature's coin decides it", () => {
    const { game } = table();
    const bears = [0, 1, 2, 3, 4, 5].map(() => spawn(game, "Grizzly Bears", B));
    const rakdos = enter(game, "Rakdos, the Showstopper");
    expect(zone(game, rakdos)).toBe("battlefield");
    const gone = bears.filter((id) => zone(game, id) === "graveyard").length;
    expect(gone + bears.filter((id) => zone(game, id) === "battlefield").length).toBe(6);
    expect(graveyard(game, B).length).toBe(gone);
  });

  it("The Enigma Jewel: crafted with four nonlands with activated abilities, Locus has their abilities", () => {
    const { game, a } = table();
    lands(game, "Island", 9);
    const jewel = spawn(game, "The Enigma Jewel");
    const stones = [0, 1, 2, 3].map(() => toGraveyard(game, "Mind Stone"));
    toGraveyard(game, "Ornithopter");
    const seen = pickFromZone(a, ...stones);
    activate(game, jewel, 1);
    expect(seen.offered).not.toEqual(expect.arrayContaining([named(game, "Ornithopter", A)[0]]));
    expect(printedCardName(game.state.objects[jewel])).toBe("Locus of Enlightenment");
    expect(game.legalActions(A).some((l) => l.kind === "activate-ability" && l.source === jewel)).toBe(true);
  });

  it("Crabomination: the opponent exiles a library card, a graveyard card and a hand card", () => {
    const { game } = table();
    const opt = toGraveyard(game, "Opt", B);
    const top = toLibrary(game, "Grizzly Bears", B);
    const handBefore = hand(game, B).length;
    enter(game, "Crabomination");
    expect(zone(game, top)).toBe("exile");
    expect(zone(game, opt)).toBe("exile");
    expect(hand(game, B).length).toBe(handBefore - 1);
  });
});


