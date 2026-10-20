/**
 * Innistrad: Crimson Vow, group b. One test (or two) per card, on its
 * riskiest clause and the edge its rulings call out.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { printedCardName } from "../state.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
  pickModes,
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
  types,
  watchTargets,
  zone,
} from "./harness.js";

const faceName = (game: Game, id: ObjectId): string => printedCardName(game.state.objects[id]);
const becomeNight = (game: Game): void => game.debugApplyEffect(A, { kind: "day-night", value: "night" }, []);
const pool = (game: Game, player: PlayerId = A): number => game.state.players[player].manaPool.length;

describe("Avabruck Caretaker // Hollowhenge Huntmaster", () => {
  it("puts two +1/+1 counters on another target creature you control at the beginning of combat", () => {
    const { game, a } = table();
    const caretaker = spawn(game, "Avabruck Caretaker");
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    const seen = watchTargets(a, () => [bears]);
    toStep(game, "postcombat-main");
    expect(seen.asked).toBe(1);
    expect([...(seen.offered[0] ?? [])].sort()).toEqual([bears, elves].sort());
    expect(counters(game, bears)).toBe(2);
    expect(counters(game, caretaker)).toBe(0);
    expect(keywords(game, caretaker).has("hexproof")).toBe(true);
  });

  it("at night, Hollowhenge Huntmaster gives your other permanents hexproof and counters each creature", () => {
    const { game } = table();
    const caretaker = spawn(game, "Avabruck Caretaker");
    const bears = spawn(game, "Grizzly Bears");
    const forest = spawn(game, "Forest");
    becomeNight(game);
    expect(faceName(game, caretaker)).toBe("Hollowhenge Huntmaster");
    expect(keywords(game, bears).has("hexproof")).toBe(true);
    expect(keywords(game, forest).has("hexproof")).toBe(true);
    expect(keywords(game, spawn(game, "Grizzly Bears", B)).has("hexproof")).toBe(false);
    toStep(game, "postcombat-main");
    expect(counters(game, caretaker)).toBe(2);
    expect(counters(game, bears)).toBe(2);
  });
});

describe("Howlpack Piper // Wildsong Howler", () => {
  it("puts a creature from hand onto the battlefield, and untaps only for a Wolf or Werewolf", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    const piper = spawn(game, "Howlpack Piper");
    const wolf = toHand(game, "Runebound Wolf");
    pickFromZone(a, wolf);
    activate(game, piper);
    expect(zone(game, wolf)).toBe("battlefield");
    expect(game.state.objects[piper].tapped).toBe(false);

    const bears = toHand(game, "Grizzly Bears");
    pickFromZone(a, bears);
    activate(game, piper);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[piper].tapped).toBe(true);
  });

  it("Wildsong Howler looks at the top six as it transforms into it", () => {
    const { game, a } = table();
    const piper = spawn(game, "Howlpack Piper");
    const bears = toLibrary(game, "Grizzly Bears");
    pickFromZone(a, bears);
    becomeNight(game);
    settle(game);
    expect(faceName(game, piper)).toBe("Wildsong Howler");
    expect(zone(game, bears)).toBe("hand");
  });
});

describe("Ascendant Packleader", () => {
  it("enters with a counter only if you already control a permanent with mana value 4 or greater", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const first = toHand(game, "Ascendant Packleader");
    cast(game, first);
    expect(counters(game, first)).toBe(0);
    spawn(game, "Hill Giant");
    const second = toHand(game, "Ascendant Packleader");
    cast(game, second);
    expect(counters(game, second)).toBe(1);
  });

  it("grows when you cast a spell with mana value 4 or greater", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const packleader = spawn(game, "Ascendant Packleader");
    cast(game, toHand(game, "Hill Giant"));
    expect(counters(game, packleader)).toBe(1);
  });
});

describe("Bloody Betrayal", () => {
  it("steals, untaps and hastes the creature, and makes a Blood token", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const giant = spawn(game, "Hill Giant", B, { tapped: true, sick: true });
    cast(game, toHand(game, "Bloody Betrayal"), { targets: [ref(giant)] });
    expect(controller(game, giant)).toBe(A);
    expect(game.state.objects[giant].tapped).toBe(false);
    expect(keywords(game, giant).has("haste")).toBe(true);
    expect(tokensNamed(game, "Blood Token", A)).toBe(1);
  });
});

describe("Vampires' Vengeance", () => {
  it("deals 2 damage to each non-Vampire creature and makes a Blood token", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const vampire = spawn(game, "Wedding Security");
    cast(game, toHand(game, "Vampires' Vengeance"));
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[vampire].damageMarked ?? 0).toBe(0);
    expect(tokensNamed(game, "Blood Token", A)).toBe(1);
  });
});

describe("Lantern of the Lost", () => {
  it("exiles a target card from a graveyard as it enters; later exiles every graveyard and draws", () => {
    const { game, a } = table();
    const theirs = toGraveyard(game, "Grizzly Bears", B);
    const other = toGraveyard(game, "Hill Giant", B);
    pickTargets(a, theirs);
    const lantern = enter(game, "Lantern of the Lost");
    expect(zone(game, theirs)).toBe("exile");
    expect(zone(game, other)).toBe("graveyard");
    const mine = toGraveyard(game, "Grizzly Bears");
    lands(game, "Wastes", 1);
    const before = hand(game).length;
    activate(game, lantern);
    expect(zone(game, lantern)).toBe("exile");
    expect(zone(game, other)).toBe("exile");
    expect(zone(game, mine)).toBe("exile");
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Foreboding Statue // Forsaken Thresher", () => {
  it("puts an omen counter on itself as it taps for mana", () => {
    const { game } = table();
    const statue = spawn(game, "Foreboding Statue");
    game.dispatch({ type: "activate-ability", player: A, source: statue, abilityIndex: 0, targets: [], manaColors: ["G"] });
    expect(counters(game, statue, "omen")).toBe(1);
    expect(pool(game)).toBe(1);
  });

  it("with three omen counters it untaps and transforms in your end step; the Thresher adds mana in your first main phase", () => {
    const { game, a } = table();
    const statue = spawn(game, "Foreboding Statue", A, { tapped: true });
    game.state.objects[statue].counters.omen = 2;
    toStep(game, "end");
    settle(game);
    expect(faceName(game, statue)).toBe("Foreboding Statue");

    game.state.objects[statue].counters.omen = 3;
    game.state.objects[statue].tapped = true;
    toStep(game, "end");
    settle(game);
    expect(faceName(game, statue)).toBe("Forsaken Thresher");
    expect(game.state.objects[statue].tapped).toBe(false);
    expect(pt(game, statue)).toEqual({ power: 5, toughness: 5 });

    pickModes(a, 3);
    toStep(game, "precombat-main");
    settle(game);
    expect(game.state.players[A].manaPool.map((u) => u.type)).toEqual(["R"]);
  });
});

describe("Runebound Wolf", () => {
  it("deals damage equal to the Wolves and Werewolves you control to target opponent", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const wolf = spawn(game, "Runebound Wolf");
    spawn(game, "Runebound Wolf");
    spawn(game, "Avabruck Caretaker"); // a Werewolf
    spawn(game, "Grizzly Bears");
    activate(game, wolf, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
  });
});

describe("Reclusive Taxidermist", () => {
  it("gets +3/+2 with four or more creature cards in your graveyard", () => {
    const { game } = table();
    const taxidermist = spawn(game, "Reclusive Taxidermist");
    for (let i = 0; i < 3; i += 1) toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Lightning Bolt");
    expect(pt(game, taxidermist)).toEqual({ power: 1, toughness: 2 });
    toGraveyard(game, "Hill Giant");
    expect(pt(game, taxidermist)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Dorothea, Vengeful Victim // Dorothea's Retribution", () => {
  it("is sacrificed at end of combat after it attacks", () => {
    const { game, a } = table();
    const dorothea = spawn(game, "Dorothea, Vengeful Victim");
    attack(game, a, [dorothea]);
    expect(life(game, B)).toBe(16);
    expect(zone(game, dorothea)).toBe("graveyard");
  });

  it("is sacrificed at end of combat after it blocks", () => {
    const { game, a, b } = table();
    const dorothea = spawn(game, "Dorothea, Vengeful Victim", B);
    const bears = spawn(game, "Grizzly Bears");
    b.declareBlockersFn = () => [{ blocker: dorothea, attacker: bears }];
    attack(game, a, [bears]);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, dorothea)).toBe("graveyard");
  });

  it("cast with disturb, the Aura makes an attacking 4/4 Spirit that's sacrificed at end of combat, and is exiled instead of dying", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    lands(game, "Island", 1);
    const card = toGraveyard(game, "Dorothea, Vengeful Victim");
    const bears = spawn(game, "Grizzly Bears");
    game.dispatch({ type: "cast-spell", player: A, card, targets: [ref(bears)], via: "disturb", face: 1 });
    settle(game);
    expect(zone(game, card)).toBe("battlefield");
    expect(faceName(game, card)).toBe("Dorothea's Retribution");
    expect(game.state.objects[card].attachedTo).toBe(bears);

    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "combat-damage");
    const spirits = named(game, "Spirit Token (Dorothea's Retribution)");
    expect(spirits).toHaveLength(1);
    expect(game.state.objects[spirits[0]!].tapped).toBe(true);
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(14);
    expect(tokensNamed(game, "Spirit Token (Dorothea's Retribution)")).toBe(0);

    destroy(game, card);
    expect(zone(game, card)).toBe("exile");
  });
});

describe("Wedding Security", () => {
  it("may sacrifice a Blood token as it attacks to grow and draw", () => {
    const { game, a } = table();
    const security = spawn(game, "Wedding Security");
    game.debugApplyEffect(A, { kind: "create-token", token: "Blood Token", count: 1 }, []);
    const before = hand(game).length;
    pickModes(a, 0);
    attack(game, a, [security]);
    expect(tokensNamed(game, "Blood Token", A)).toBe(0);
    expect(counters(game, security)).toBe(1);
    expect(hand(game).length).toBe(before + 1);
    expect(life(game, B)).toBe(15);
  });
});

describe("Stensia Uprising", () => {
  it("makes a Human, and at exactly thirteen permanents may be sacrificed to deal 7 damage", () => {
    const { game, a } = table();
    spawn(game, "Stensia Uprising");
    lands(game, "Mountain", 11); // 12 permanents, then the Human makes 13
    pickModes(a, 0);
    pickTargets(a, B);
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Red Human Token", A)).toBe(1);
    expect(named(game, "Stensia Uprising")).toHaveLength(0);
    expect(life(game, B)).toBe(13);
  });

  it("at fourteen permanents it only makes the Human", () => {
    const { game, a } = table();
    const uprising = spawn(game, "Stensia Uprising");
    lands(game, "Mountain", 12);
    pickModes(a, 0);
    pickTargets(a, B);
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Red Human Token", A)).toBe(1);
    expect(zone(game, uprising)).toBe("battlefield");
    expect(life(game, B)).toBe(20);
  });
});

describe("Bloodsworn Squire // Bloodsworn Knight", () => {
  it("gains indestructible and taps; with four creature cards in your graveyard it transforms, keeping indestructible", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const squire = spawn(game, "Bloodsworn Squire");
    for (let i = 0; i < 3; i += 1) toGraveyard(game, "Grizzly Bears");
    toHand(game, "Lightning Bolt");
    activate(game, squire);
    expect(game.state.objects[squire].tapped).toBe(true);
    expect(keywords(game, squire).has("indestructible")).toBe(true);
    expect(faceName(game, squire)).toBe("Bloodsworn Squire");

    toGraveyard(game, "Hill Giant");
    game.state.objects[squire].tapped = false;
    activate(game, squire);
    expect(faceName(game, squire)).toBe("Bloodsworn Knight");
    expect(keywords(game, squire).has("indestructible")).toBe(true);
    expect(pt(game, squire)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Odric, Blood-Cursed", () => {
  it("counts each listed ability once among creatures you control", () => {
    const { game } = table();
    spawn(game, "Serra Angel"); // flying, vigilance
    spawn(game, "Wind Drake"); // flying again
    spawn(game, "Serra Angel", B); // not yours
    enter(game, "Odric, Blood-Cursed");
    expect(tokensNamed(game, "Blood Token", A)).toBe(2);
  });
});

describe("Arm the Cathars", () => {
  it("pumps three different creatures +3/+3, +2/+2 and +1/+1, all with vigilance", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const x = spawn(game, "Grizzly Bears");
    const y = spawn(game, "Grizzly Bears");
    const z = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Arm the Cathars"), { targets: [ref(x), ref(y), ref(z)] });
    expect(pt(game, x)).toEqual({ power: 5, toughness: 5 });
    expect(pt(game, y)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, z)).toEqual({ power: 3, toughness: 3 });
    for (const id of [x, y, z]) expect(keywords(game, id).has("vigilance")).toBe(true);
  });

  it("can't name the same creature twice", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const x = spawn(game, "Grizzly Bears");
    expect(() => cast(game, toHand(game, "Arm the Cathars"), { targets: [ref(x), ref(x), null] })).toThrow();
  });
});

describe("Honeymoon Hearse", () => {
  it("tapping two untapped creatures you control makes it a 5/5 artifact creature until end of turn", () => {
    const { game } = table();
    const hearse = spawn(game, "Honeymoon Hearse");
    const x = spawn(game, "Grizzly Bears");
    const y = spawn(game, "Grizzly Bears");
    expect(types(game, hearse)).not.toContain("creature");
    activate(game, hearse);
    expect(game.state.objects[x].tapped && game.state.objects[y].tapped).toBe(true);
    expect(types(game, hearse)).toContain("creature");
    expect(pt(game, hearse)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Panicked Bystander // Cackling Culprit", () => {
  it("gains 1 life when it or another creature you control dies, and transforms after 3 life gained", () => {
    const { game } = table();
    const bystander = spawn(game, "Panicked Bystander");
    const bears = spawn(game, "Grizzly Bears");
    destroy(game, bears);
    destroy(game, spawn(game, "Grizzly Bears", B)); // not yours
    expect(life(game)).toBe(21);
    toStep(game, "end");
    settle(game);
    expect(faceName(game, bystander)).toBe("Panicked Bystander");
  });

  it("transforms in your end step if you gained 3 life this turn, even having lost some; Cackling Culprit gains deathtouch", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const bystander = spawn(game, "Panicked Bystander");
    game.debugApplyEffect(A, { kind: "gain-life", amount: 3 }, []);
    game.debugApplyEffect(A, { kind: "lose-life", amount: 3, who: "you" }, []);
    toStep(game, "end");
    settle(game);
    expect(faceName(game, bystander)).toBe("Cackling Culprit");
    expect(pt(game, bystander)).toEqual({ power: 3, toughness: 5 });
    activate(game, bystander);
    expect(keywords(game, bystander).has("deathtouch")).toBe(true);
  });
});

describe("Steelclad Spirit", () => {
  it("can attack the turn an enchantment you control enters", () => {
    const { game, a } = table();
    const spirit = spawn(game, "Steelclad Spirit");
    attack(game, a, [spirit]);
    expect(life(game, B)).toBe(20);

    const { game: game2, a: a2 } = table();
    const spirit2 = spawn(game2, "Steelclad Spirit");
    enter(game2, "Glorious Anthem");
    attack(game2, a2, [spirit2]);
    expect(life(game2, B)).toBe(16);
    expect(graveyard(game2)).toHaveLength(0);
  });
});
