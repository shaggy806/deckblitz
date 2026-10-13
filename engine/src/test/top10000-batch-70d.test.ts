/**
 * Card batch 70, part d (2026-10-12): the Theros Gods and the other cards
 * devotion and self type changes unblock — `devotion.test.ts` has the
 * mechanics. Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
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
  subtypes,
  supertypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

/** `n` copies of a card with {W}{W}, {U}{U}, … in its cost, for devotion. */
const devotees = (game: ReturnType<typeof table>["game"], name: string, n: number, player = A): ObjectId[] =>
  Array.from({ length: n }, () => spawn(game, name, player));

describe("the mono-coloured Gods' other abilities", () => {
  it("Heliod, God of the Sun: other creatures have vigilance; {2}{W}{W} makes a 2/1 Cleric enchantment creature", () => {
    const { game } = table();
    const heliod = spawn(game, "Heliod, God of the Sun");
    const bears = spawn(game, "Grizzly Bears");
    expect(keywords(game, bears).has("vigilance")).toBe(true);
    lands(game, "Plains", 4);
    activate(game, heliod);
    const [cleric] = named(game, "Cleric Token");
    expect(types(game, cleric)).toEqual(["enchantment", "creature"]);
    expect(pt(game, cleric)).toEqual({ power: 2, toughness: 1 });
  });

  it("Purphoros, God of the Forge: another creature entering deals 2 to each opponent; {2}{R} pumps", () => {
    const { game } = table({ players: 3 });
    const purphoros = spawn(game, "Purphoros, God of the Forge");
    enter(game, "Grizzly Bears");
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(20);
    lands(game, "Mountain", 3);
    activate(game, purphoros);
    expect(pt(game, named(game, "Grizzly Bears")[0])).toEqual({ power: 3, toughness: 2 });
  });

  it("Nylea, God of the Hunt: other creatures have trample; {3}{G}: +2/+2", () => {
    const { game } = table();
    const nylea = spawn(game, "Nylea, God of the Hunt");
    const bears = spawn(game, "Grizzly Bears");
    expect(keywords(game, bears).has("trample")).toBe(true);
    lands(game, "Forest", 4);
    activate(game, nylea, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });

  it("Thassa, God of the Sea: {1}{U} makes a creature you control unblockable this turn", () => {
    const { game } = table();
    const thassa = spawn(game, "Thassa, God of the Sea");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 2);
    activate(game, thassa, 0, { targets: [ref(bears)] });
    expect(keywords(game, bears).has("unblockable")).toBe(true);
  });

  it("Erebos, God of the Dead: opponents can't gain life; {1}{B}, pay 2 life: draw", () => {
    const { game } = table();
    const erebos = spawn(game, "Erebos, God of the Dead");
    game.debugApplyEffect(B, { kind: "gain-life", amount: 3 });
    expect(life(game, B)).toBe(20);
    lands(game, "Swamp", 2);
    toLibrary(game, "Grizzly Bears");
    const before = hand(game).length;
    activate(game, erebos);
    expect(hand(game).length).toBe(before + 1);
    expect(life(game, A)).toBe(18);
  });

  it("Heliod, Sun-Crowned: gaining life puts a +1/+1 counter on a creature or enchantment you control — itself too", () => {
    const { game, a } = table();
    const heliod = spawn(game, "Heliod, Sun-Crowned");
    pickTargets(a, heliod);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 1 });
    settle(game);
    // Not a creature, so the counter does nothing yet (its ruling).
    expect(counters(game, heliod)).toBe(1);
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 2);
    activate(game, heliod, 0, { targets: [ref(bears)] });
    expect(keywords(game, bears).has("lifelink")).toBe(true);
  });

  it("Thassa, Deep-Dwelling: blinks up to one other creature you control at your end step; {3}{U} taps another creature", () => {
    const { game, a } = table();
    const thassa = spawn(game, "Thassa, Deep-Dwelling");
    const soul = spawn(game, "Soul Warden"); // whenever another creature enters, gain 1
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 4);
    activate(game, thassa, 0, { targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(true);
    const stint = game.state.objects[soul].zoneChangeCount ?? 0;
    pickTargets(a, soul);
    toStep(game, "end");
    settle(game);
    const [back] = named(game, "Soul Warden");
    expect(zone(game, back)).toBe("battlefield");
    expect(game.state.objects[back].zoneChangeCount).toBeGreaterThan(stint);
  });

  it("Purphoros, Bronze-Blooded: other creatures have haste; {2}{R} puts a red or artifact creature from hand, sacrificed at the next end step", () => {
    const { game, a } = table();
    const purphoros = spawn(game, "Purphoros, Bronze-Blooded");
    const goblin = toHand(game, "Raging Goblin");
    toHand(game, "Grizzly Bears"); // green: not offered
    lands(game, "Mountain", 3);
    let offered: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible, _min, max) => {
      offered = eligible;
      return eligible.slice(0, max);
    };
    activate(game, purphoros);
    expect(offered).toEqual([goblin]);
    expect(zone(game, goblin)).toBe("battlefield");
    toStep(game, "end");
    settle(game);
    expect(graveyard(game)).toContain(goblin);
  });

  it("Erebos, Bleak-Hearted: another creature dying offers 2 life for a card", () => {
    const { game, a } = table();
    spawn(game, "Erebos, Bleak-Hearted");
    const bears = spawn(game, "Grizzly Bears");
    toLibrary(game, "Memnite");
    pickModes(a, 0);
    const before = hand(game).length;
    destroy(game, bears);
    expect(hand(game).length).toBe(before + 1);
    expect(life(game, A)).toBe(18);
  });

  it("Nylea, Keen-Eyed: creature spells cost {1} less; {2}{G} reveals the top card — a creature to hand, else maybe the graveyard", () => {
    const { game, a } = table();
    const nylea = spawn(game, "Nylea, Keen-Eyed");
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Grizzly Bears")); // {1}{G} for {G}
    expect(named(game, "Grizzly Bears")).toHaveLength(1);
    lands(game, "Forest", 3);
    const elves = toLibrary(game, "Llanowar Elves");
    activate(game, nylea);
    expect(zone(game, elves)).toBe("hand");
    lands(game, "Forest", 3);
    const bolt = toLibrary(game, "Lightning Bolt");
    a.chooseFromZoneFn = (_view, eligible, _min, max) => eligible.slice(0, max);
    activate(game, nylea);
    expect(zone(game, bolt)).toBe("graveyard");
  });
});

describe("the two-colour Gods", () => {
  it("Phenax: creatures you control have '{T}: target player mills X', X the creature's toughness — Phenax's own nothing once it isn't a creature", () => {
    const { game } = table();
    const phenax = spawn(game, "Phenax, God of Deception");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, bears, 0, { targets: [ref(B)] });
    expect(graveyard(game, B)).toHaveLength(2);
    // Devotion to blue and black: Phenax's {U}{B} and three Harvest Gwyllions' {W/B}{W/B} make eight.
    devotees(game, "Harvest Gwyllion", 3);
    expect(types(game, phenax)).toContain("creature");
    activate(game, phenax, 0, { targets: [ref(B)], settle: false });
    // In response, it stops being a creature: no toughness, nothing milled (the ruling).
    destroy(game, named(game, "Harvest Gwyllion")[0], B);
    settle(game);
    expect(types(game, phenax)).not.toContain("creature");
    expect(graveyard(game, B)).toHaveLength(2);
  });

  it("Athreos, God of Passage: another creature you own that dies returns to hand unless the targeted opponent pays 3 life", () => {
    const { game, a, b } = table();
    spawn(game, "Athreos, God of Passage");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, B);
    destroy(game, bears);
    expect(zone(game, bears)).toBe("hand");
    const lions = spawn(game, "Savannah Lions");
    pickModes(b, 0);
    destroy(game, lions);
    expect(zone(game, lions)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
  });

  it("Xenagos: at the beginning of your combat, another creature you control gains haste and +X/+X, X its power", () => {
    const { game, a } = table();
    spawn(game, "Xenagos, God of Revels");
    const giant = spawn(game, "Hill Giant", A, { sick: true });
    pickTargets(a, giant);
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, giant)).toEqual({ power: 6, toughness: 6 });
    expect(keywords(game, giant).has("haste")).toBe(true);
  });

  it("Mogis: at each opponent's upkeep, 2 damage unless they sacrifice a creature", () => {
    const { game } = table();
    spawn(game, "Mogis, God of Slaughter");
    toStep(game, "upkeep", B);
    settle(game);
    expect(life(game, B)).toBe(18);
  });

  it("Karametra: casting a creature spell may fetch a Forest or Plains card, tapped", () => {
    const { game, a } = table();
    spawn(game, "Karametra, God of Harvests");
    const forest = toLibrary(game, "Forest");
    lands(game, "Forest", 2);
    pickModes(a, 0);
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(zone(game, forest)).toBe("battlefield");
    expect(game.state.objects[forest].tapped).toBe(true);
  });

  it("Athreos, Shroud-Veiled: a coin counter at your end step; a creature with one that dies comes back under your control", () => {
    const { game, a } = table();
    spawn(game, "Athreos, Shroud-Veiled");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    toStep(game, "end");
    settle(game);
    expect(counters(game, bears, "coin")).toBe(1);
    destroy(game, bears, A);
    const [back] = named(game, "Grizzly Bears");
    expect(back).toBeDefined();
    expect(game.state.objects[back].controller).toBe(A);
    expect(counters(game, back, "coin")).toBe(0);
  });

  it("Kruphix: mana that would empty becomes colorless and stays", () => {
    const { game } = table();
    spawn(game, "Kruphix, God of Horizons");
    game.debugApplyEffect(A, { kind: "add-mana", mana: "G", amount: 2 });
    toStep(game, "postcombat-main");
    expect(game.state.players[A].manaPool.map((u) => u.type)).toEqual(["C", "C"]);
  });

  it("Klothys: exiles a card from a graveyard at your first main phase — a land makes mana, anything else 2 life and 2 to each opponent", () => {
    const { game, a } = table({ step: "upkeep" });
    spawn(game, "Klothys, God of Destiny");
    const bolt = toGraveyard(game, "Lightning Bolt", B);
    pickTargets(a, bolt);
    toStep(game, "precombat-main");
    settle(game);
    expect(zone(game, bolt)).toBe("exile");
    expect(life(game, A)).toBe(22);
    expect(life(game, B)).toBe(18);
    const forest = toGraveyard(game, "Forest", B);
    pickTargets(a, forest);
    toStep(game, "precombat-main");
    settle(game);
    expect(zone(game, forest)).toBe("exile");
    expect(game.state.players[A].manaPool).toHaveLength(1);
  });

  it("Iroas: creatures you control have menace; damage to attacking creatures you control is prevented", () => {
    const { game, a, b } = table();
    spawn(game, "Iroas, God of Victory");
    const bears = spawn(game, "Grizzly Bears");
    expect(keywords(game, bears).has("menace")).toBe(true);
    const giants = [spawn(game, "Hill Giant", B), spawn(game, "Hill Giant", B)];
    b.declareBlockersFn = () => giants.map((blocker) => ({ blocker, attacker: bears }));
    attack(game, a, [bears]);
    // Blocked by both (menace), and none of their 6 damage dealt.
    expect(life(game, B)).toBe(20);
    expect(zone(game, bears)).toBe("battlefield");
    // Not attacking any more: damage gets through again.
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("Keranos: reveals the first card you draw on your turn — a land draws another, a nonland deals 3 to any target", () => {
    const { game, a } = table({ step: "upkeep" });
    spawn(game, "Keranos, God of Storms");
    const bolt = toLibrary(game, "Lightning Bolt");
    pickTargets(a, B);
    toStep(game, "draw");
    settle(game);
    expect(zone(game, bolt)).toBe("hand");
    expect(game.state.revealedThisTurn).toContain(bolt);
    expect(life(game, B)).toBe(17);
    // Not on an opponent's turn, and only the first card of yours.
    const forest = toLibrary(game, "Forest");
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    expect(zone(game, forest)).toBe("hand");
    expect(game.state.revealedThisTurn).not.toContain(forest);
  });

  it("Keranos: a land first draw is revealed and draws a card", () => {
    const { game } = table({ step: "upkeep" });
    spawn(game, "Keranos, God of Storms");
    const second = toLibrary(game, "Memnite");
    const forest = toLibrary(game, "Forest");
    toStep(game, "draw");
    settle(game);
    expect(zone(game, forest)).toBe("hand");
    expect(zone(game, second)).toBe("hand");
  });
});

describe("devotion's amounts and conditions on other cards", () => {
  it("Renata: power equal to devotion to green; each other creature you control enters with a +1/+1 counter", () => {
    const { game } = table();
    const renata = spawn(game, "Renata, Called to the Hunt");
    expect(pt(game, renata)).toEqual({ power: 2, toughness: 3 });
    const bears = enter(game, "Grizzly Bears");
    expect(counters(game, bears)).toBe(1);
    expect(pt(game, renata)).toEqual({ power: 3, toughness: 3 });
    // Off the battlefield too (the ruling): its owner's devotion.
    const card = toHand(game, "Renata, Called to the Hunt");
    expect(pt(game, card).power).toBe(3);
  });

  it("Anax: power equal to devotion to red; a nontoken creature of yours dying makes Satyrs, two for power 4 or more", () => {
    const { game } = table();
    const anax = spawn(game, "Anax, Hardened in the Forge");
    expect(pt(game, anax).power).toBe(2);
    const goblin = spawn(game, "Raging Goblin");
    expect(pt(game, anax).power).toBe(3);
    destroy(game, goblin);
    expect(tokensNamed(game, "Satyr Token")).toBe(1);
    const giant = spawn(game, "Hill Giant");
    game.debugApplyEffect(A, { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" }, [ref(giant)]);
    destroy(game, giant);
    expect(tokensNamed(game, "Satyr Token")).toBe(3);
    // Anax itself, at power 2: one.
    destroy(game, anax);
    expect(tokensNamed(game, "Satyr Token")).toBe(4);
    const [satyr] = named(game, "Satyr Token");
    expect(game.state.objects[satyr].controller).toBe(A);
  });

  it("March of the Canonized: X lifelink Vampires; at upkeep a Vampire Demon only with devotion to white and black seven or more", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    cast(game, toHand(game, "March of the Canonized"), { x: 3 });
    expect(tokensNamed(game, "Lifelink Vampire Token")).toBe(3);
    nextUpkeep(game);
    expect(tokensNamed(game, "Vampire Demon Token")).toBe(0);
    // {W}{W} + three Harvest Gwyllions' {W/B}{W/B}: eight.
    devotees(game, "Harvest Gwyllion", 3);
    nextUpkeep(game);
    expect(tokensNamed(game, "Vampire Demon Token")).toBe(1);
  });

  it("Altar of the Pantheon: taps for any colour, gaining 1 life with a God, Demigod or legendary enchantment", () => {
    const { game } = table();
    const altar = spawn(game, "Altar of the Pantheon");
    activate(game, altar);
    expect(life(game, A)).toBe(20);
    expect(game.state.players[A].manaPool).toHaveLength(1);
    spawn(game, "Heliod, God of the Sun"); // not a creature — no God — but a legendary enchantment
    game.state.objects[altar].tapped = false;
    activate(game, altar);
    expect(life(game, A)).toBe(21);
  });
});

describe("self type changes", () => {
  it("Arixmethes: enters tapped with five slumber counters as a land, taps for {G}{U} at once, and is a 12/12 once they're gone", () => {
    const { game, a } = table();
    const arix = enter(game, "Arixmethes, Slumbering Isle");
    expect(game.state.objects[arix].tapped).toBe(true);
    expect(counters(game, arix, "slumber")).toBe(5);
    expect(types(game, arix)).toEqual(["land"]);
    expect(subtypes(game, arix)).toEqual([]);
    expect(supertypes(game, arix)).toEqual(["legendary"]);
    game.state.objects[arix].tapped = false;
    activate(game, arix);
    expect(game.state.players[A].manaPool.map((u) => u.type).sort()).toEqual(["G", "U"]);
    game.state.players[A].manaPool = [];
    pickModes(a, 0);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(counters(game, arix, "slumber")).toBe(4);
    game.state.objects[arix].counters.slumber = 0;
    expect(types(game, arix)).toEqual(["creature"]);
    expect(subtypes(game, arix)).toEqual(["Kraken"]);
    expect(pt(game, arix)).toEqual({ power: 12, toughness: 12 });
  });

  it("Swift Reconfiguration: the enchanted creature is a noncreature Vehicle artifact with crew 5, a creature again once crewed", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant");
    lands(game, "Plains", 1);
    pickTargets(a, giant);
    cast(game, toHand(game, "Swift Reconfiguration"), { targets: [ref(giant)] });
    expect(types(game, giant)).toEqual(["artifact"]);
    expect(subtypes(game, giant)).toEqual(["Vehicle"]);
    // Crew 5 with a 3/3 and a 2/2.
    spawn(game, "Hill Giant");
    spawn(game, "Grizzly Bears");
    a.choosePermanentsFn = (_view, eligible) => eligible;
    activate(game, giant, 0);
    expect(types(game, giant)).toEqual(["artifact", "creature"]);
    expect(zone(game, named(game, "Swift Reconfiguration")[0])).toBe("battlefield");
  });

  it("Minas Morgul: a shadow counter gives shadow, and makes it a Wraith while it's there", () => {
    const { game } = table();
    const morgul = spawn(game, "Minas Morgul, Dark Fortress");
    expect(game.state.objects[morgul].tapped).toBe(true); // it enters tapped
    game.state.objects[morgul].tapped = false;
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 4);
    activate(game, morgul, 1, { targets: [ref(bears)] });
    expect(keywords(game, bears).has("shadow")).toBe(true);
    expect(subtypes(game, bears)).toEqual(["Bear", "Wraith"]);
    game.state.objects[bears].counters.shadow = 0;
    expect(keywords(game, bears).has("shadow")).toBe(false);
  });

  it("Titan of Littjara: is the chosen type too, and draws for each other creature sharing a type with it, then discards", () => {
    const { game, a } = table();
    a.chooseCreatureTypeFn = () => "Bear";
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Raging Goblin"); // shares nothing
    lands(game, "Island", 6);
    for (let i = 0; i < 3; i += 1) toLibrary(game, "Memnite");
    pickModes(a, 0);
    const before = hand(game).length;
    cast(game, toHand(game, "Titan of Littjara"));
    const [titan] = named(game, "Titan of Littjara");
    expect(subtypes(game, titan)).toEqual(["Illusion", "Bear"]);
    // Two drawn, one discarded.
    expect(hand(game).length).toBe(before + 1);
  });
});

/** To alice's next upkeep, its triggers settled. */
function nextUpkeep(game: ReturnType<typeof table>["game"]): void {
  toStep(game, "upkeep");
  settle(game);
}
