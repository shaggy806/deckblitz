/**
 * The set walk, batch 67, part e (2026-10-12): saddle (rule 702.171,
 * Outlaws of Thunder Junction) and the Mounts and saddlers it unblocks — the
 * "attacks while saddled" Mounts, "a creature that saddled it this turn"
 * (Giant Beaver, Rambling Possum, Calamity, The Gitrog), "if this creature
 * is saddled" (Caustic Bronco, Archmage's Newt) and the cards that saddle a
 * Mount without its saddle ability (Alacrian Armory, Guidelight Matrix,
 * Kolodin). The keyword's own rules are in `saddle.test.ts`. Written on the
 * shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  counters,
  enter,
  hand,
  keywords,
  lands,
  life,
  pickFromZone,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toLibrary,
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

/** Saddle `mount` (its saddle ability is activated ability `index`),
 * tapping `tap`; throws the engine's refusal. */
function saddleWith(game: Game, mount: ObjectId, tap: readonly ObjectId[], index = 0): void {
  const action: Action = { type: "activate-ability", player: A, source: mount, abilityIndex: index, targets: [], tap };
  const why = game.canDispatch(action);
  if (why !== null) throw new Error(why);
  game.dispatch(action);
  settle(game);
}

const saddled = (game: Game, id: ObjectId): boolean => game.state.objects[id].saddled === true;

/** `name` on alice's battlefield, saddled by a fresh `by` creature each. */
function saddledMount(game: Game, name: string, by: readonly string[], index = 0): { mount: ObjectId; riders: ObjectId[] } {
  const mount = spawn(game, name);
  const riders = by.map((n) => spawn(game, n));
  saddleWith(game, mount, riders, index);
  expect(saddled(game, mount)).toBe(true);
  return { mount, riders };
}

describe("attacks while saddled: pumps and keywords", () => {
  it("Brightfield Glider gets +1/+2 and flying", () => {
    const { game, a } = table();
    const { mount } = saddledMount(game, "Brightfield Glider", ["Hill Giant"]);
    attack(game, a, [mount]);
    expect(pt(game, mount)).toEqual({ power: 2, toughness: 3 });
    expect(keywords(game, mount).has("flying")).toBe(true);
    expect(life(game, B)).toBe(18);
  });

  it("Quilled Charger gets +1/+2 and menace; unsaddled, nothing", () => {
    const { game, a } = table();
    const { mount } = saddledMount(game, "Quilled Charger", ["Grizzly Bears"]);
    attack(game, a, [mount]);
    expect(pt(game, mount)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, mount).has("menace")).toBe(true);
    const { game: g2, a: a2 } = table();
    const plain = spawn(g2, "Quilled Charger");
    attack(g2, a2, [plain]);
    expect(pt(g2, plain)).toEqual({ power: 4, toughness: 3 });
  });

  it("Venomsac Lagac gets +0/+3", () => {
    const { game, a } = table();
    const { mount } = saddledMount(game, "Venomsac Lagac", ["Grizzly Bears"]);
    attack(game, a, [mount]);
    expect(pt(game, mount)).toEqual({ power: 2, toughness: 4 });
  });

  it("Trained Arynx gains first strike and scries 1", () => {
    const { game, a } = table();
    const { mount } = saddledMount(game, "Trained Arynx", ["Grizzly Bears"]);
    let scried = 0;
    a.chooseScryFn = () => {
      scried += 1;
      return [];
    };
    attack(game, a, [mount]);
    expect(keywords(game, mount).has("first-strike")).toBe(true);
    expect(scried).toBe(1);
  });

  it("Drover Grizzly gives every creature you control trample", () => {
    const { game, a } = table();
    const { mount, riders } = saddledMount(game, "Drover Grizzly", ["Llanowar Elves"]);
    attack(game, a, [mount]);
    expect(keywords(game, mount).has("trample")).toBe(true);
    expect(keywords(game, riders[0]).has("trample")).toBe(true);
  });

  it("Congregation Gryff gets +X/+X for the Mounts you control", () => {
    const { game, a } = table();
    spawn(game, "Venomsac Lagac");
    const { mount } = saddledMount(game, "Congregation Gryff", ["Hill Giant"]);
    attack(game, a, [mount]);
    expect(pt(game, mount)).toEqual({ power: 3, toughness: 6 });
  });

  it("Brightfield Mustang untaps and gets a +1/+1 counter, still attacking", () => {
    const { game, a } = table();
    const { mount } = saddledMount(game, "Brightfield Mustang", ["Llanowar Elves"]);
    attack(game, a, [mount]);
    expect(game.state.objects[mount].tapped).toBe(false);
    expect(counters(game, mount)).toBe(1);
    expect(life(game, B)).toBe(16);
  });

  it("Unswerving Sloth gains indestructible and untaps every creature you control", () => {
    const { game, a } = table();
    const { mount, riders } = saddledMount(game, "Unswerving Sloth", ["Hill Giant", "Llanowar Elves"]);
    expect(game.state.objects[riders[0]].tapped).toBe(true);
    attack(game, a, [mount]);
    expect(keywords(game, mount).has("indestructible")).toBe(true);
    expect(game.state.objects[mount].tapped).toBe(false);
    expect(game.state.objects[riders[0]].tapped).toBe(false);
    expect(game.state.objects[riders[1]].tapped).toBe(false);
  });

  it("Lagorin puts a +1/+1 counter on each of up to two target Mounts and/or Vehicles", () => {
    const { game, a } = table();
    const lagac = spawn(game, "Venomsac Lagac", B);
    const copter = spawn(game, "Smuggler's Copter");
    const { mount } = saddledMount(game, "Lagorin, Soul of Alacria", ["Llanowar Elves"]);
    pickTargets(a, lagac, copter);
    attack(game, a, [mount]);
    expect(counters(game, lagac)).toBe(1);
    expect(counters(game, copter)).toBe(1);
  });

  it("Ornery Tumblewagg's counter at the beginning of combat, doubled as it attacks saddled", () => {
    const { game, a } = table();
    const { mount } = saddledMount(game, "Ornery Tumblewagg", ["Grizzly Bears"]);
    pickTargets(a, mount);
    attack(game, a, [mount]);
    expect(counters(game, mount)).toBe(2);
    expect(pt(game, mount)).toEqual({ power: 4, toughness: 4 });
  });

  it("Bulwark Ox puts a counter on target creature; sacrificed, creatures with counters gain hexproof and indestructible", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const { mount, riders } = saddledMount(game, "Bulwark Ox", ["Llanowar Elves"], 1);
    pickTargets(a, bears);
    attack(game, a, [mount]);
    expect(counters(game, bears)).toBe(1);
    activate(game, mount, 0);
    expect(zone(game, mount)).toBe("graveyard");
    expect(keywords(game, bears).has("hexproof")).toBe(true);
    expect(keywords(game, bears).has("indestructible")).toBe(true);
    expect(keywords(game, riders[0]).has("indestructible")).toBe(false);
  });
});

describe("attacks while saddled: value", () => {
  it("Autarch Mammoth makes an Elephant as it enters and as it attacks saddled", () => {
    const { game: g1 } = table();
    enter(g1, "Autarch Mammoth");
    expect(tokensNamed(g1, "Elephant Token")).toBe(1);

    const { game, a } = table();
    const mammoth = spawn(game, "Autarch Mammoth");
    const giant = spawn(game, "Hill Giant");
    // A summoning-sick creature can saddle.
    const fresh = spawn(game, "Grizzly Bears", A, { sick: true });
    saddleWith(game, mammoth, [giant, fresh]);
    attack(game, a, [mammoth]);
    expect(tokensNamed(game, "Elephant Token")).toBe(1);
  });

  it("Bounding Felidar puts a counter on each other creature you control and gains that much life", () => {
    const { game, a } = table();
    const elves = spawn(game, "Llanowar Elves");
    const { mount, riders } = saddledMount(game, "Bounding Felidar", ["Grizzly Bears"]);
    attack(game, a, [mount]);
    expect(counters(game, elves)).toBe(1);
    expect(counters(game, riders[0])).toBe(1);
    expect(counters(game, mount)).toBe(0);
    expect(life(game, A)).toBe(22);
  });

  it("Bridled Bighorn makes a Sheep, Seraphic Steed a white Angel, Gilded Ghoda a Treasure", () => {
    const { game, a } = table();
    const bighorn = saddledMount(game, "Bridled Bighorn", ["Grizzly Bears"]).mount;
    const steed = saddledMount(game, "Seraphic Steed", ["Hill Giant", "Llanowar Elves"]).mount;
    const ghoda = saddledMount(game, "Gilded Ghoda", ["Llanowar Elves"]).mount;
    attack(game, a, [bighorn, steed, ghoda]);
    expect(tokensNamed(game, "Sheep Token")).toBe(1);
    expect(tokensNamed(game, "3/3 White Angel Token")).toBe(1);
    expect(tokensNamed(game, "Treasure Token")).toBe(1);
  });

  it("Dracosaur Auxiliary deals 2 damage to any target", () => {
    const { game, a } = table();
    const { mount } = saddledMount(game, "Dracosaur Auxiliary", ["Hill Giant"]);
    pickTargets(a, B);
    attack(game, a, [mount]);
    expect(life(game, B)).toBe(14);
  });

  it("Gila Courser exiles the top card, playable until the end of your next turn", () => {
    const { game, a } = table();
    const top = toLibrary(game, "Grizzly Bears");
    const { mount } = saddledMount(game, "Gila Courser", ["Llanowar Elves"]);
    attack(game, a, [mount]);
    expect(zone(game, top)).toBe("exile");
    expect(game.state.objects[top].impulse).toBeDefined();
  });

  it("Gloryheath Lynx finds a basic Plains", () => {
    const { game, a } = table();
    const plains = toLibrary(game, "Plains");
    const { mount } = saddledMount(game, "Gloryheath Lynx", ["Grizzly Bears"]);
    pickFromZone(a, plains);
    attack(game, a, [mount]);
    expect(zone(game, plains)).toBe("hand");
  });

  it("Guardian Sunmare puts a nonland permanent card with mana value 3 or less onto the battlefield", () => {
    const { game, a } = table();
    const bears = toLibrary(game, "Grizzly Bears");
    const { mount } = saddledMount(game, "Guardian Sunmare", ["Hill Giant", "Llanowar Elves"]);
    const seen = pickFromZone(a, bears);
    attack(game, a, [mount]);
    expect(zone(game, bears)).toBe("battlefield");
    // Never a land, whatever its mana value.
    expect(seen.offered.every((id) => !types(game, id).includes("land"))).toBe(true);
  });

  it("District Mascot enters with a counter, grows as it attacks saddled, and spends two to destroy an artifact", () => {
    const { game, a } = table();
    const mascot = enter(game, "District Mascot");
    expect(pt(game, mascot)).toEqual({ power: 1, toughness: 1 });
    const elves = spawn(game, "Llanowar Elves");
    saddleWith(game, mascot, [elves], 1);
    attack(game, a, [mascot]);
    expect(counters(game, mascot)).toBe(2);
    const ring = spawn(game, "Sol Ring", B);
    lands(game, "Forest", 2);
    activate(game, mascot, 0, { targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("graveyard");
    expect(counters(game, mascot)).toBe(0);
  });
});

describe("if this creature is saddled", () => {
  it("Caustic Bronco: unsaddled, you lose life equal to the revealed card's mana value", () => {
    const { game, a } = table();
    const bronco = spawn(game, "Caustic Bronco");
    const top = toLibrary(game, "Hill Giant");
    attack(game, a, [bronco]);
    expect(hand(game)).toContain(top);
    expect(life(game, A)).toBe(16);
    expect(life(game, B)).toBe(18);
  });

  it("Caustic Bronco: saddled, each opponent loses it instead", () => {
    const { game, a } = table({ players: 3 });
    const { mount } = saddledMount(game, "Caustic Bronco", ["Hill Giant"]);
    toLibrary(game, "Hill Giant");
    attack(game, a, [mount]);
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(14);
  });

  it("Caustic Bronco gone before its ability resolves: asked as it last was (the ruling)", () => {
    const { game, a } = table();
    const { mount } = saddledMount(game, "Caustic Bronco", ["Hill Giant"]);
    toLibrary(game, "Hill Giant");
    a.declareAttackersFn = () => [{ attacker: mount, defender: B }];
    game.advanceUntil((s) => s.zones.shared.stack.length > 0);
    game.debugMove(mount, "graveyard");
    settle(game);
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(16);
  });

  it("Archmage's Newt grants flashback for the card's mana cost, or {0} saddled", () => {
    const { game, a } = table();
    const bolt = toGraveyard(game, "Lightning Bolt");
    const newt = spawn(game, "Archmage's Newt");
    pickTargets(a, bolt);
    attack(game, a, [newt]);
    expect(game.state.objects[bolt].grantedFlashback?.cost).toBe("{R}");

    const { game: g2, a: a2 } = table();
    const bolt2 = toGraveyard(g2, "Lightning Bolt");
    const newt2 = spawn(g2, "Archmage's Newt");
    saddleWith(g2, newt2, [spawn(g2, "Hill Giant")]);
    pickTargets(a2, bolt2);
    attack(g2, a2, [newt2]);
    expect(g2.state.objects[bolt2].grantedFlashback?.cost).toBe("{0}");
  });
});

describe("a creature that saddled it this turn", () => {
  it("Rambling Possum gets +1/+2 and may return the creatures that saddled it", () => {
    const { game, a } = table();
    const possum = spawn(game, "Rambling Possum");
    const elves = spawn(game, "Llanowar Elves");
    const bears = spawn(game, "Grizzly Bears");
    const bystander = spawn(game, "Grizzly Bears");
    saddleWith(game, possum, [elves]);
    saddleWith(game, possum, [bears]);
    const seen = pickPermanents(a, elves, bears);
    attack(game, a, [possum]);
    expect(pt(game, possum)).toEqual({ power: 4, toughness: 5 });
    expect([...seen.offered].sort()).toEqual([elves, bears].sort());
    expect(zone(game, elves)).toBe("hand");
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, bystander)).toBe("battlefield");
  });

  it("Calamity copies a nonlegendary creature that saddled it twice, tapped and attacking, sacrificed at the end step", () => {
    const { game, a } = table();
    const calamity = spawn(game, "Calamity, Galloping Inferno");
    const giant = spawn(game, "Hill Giant");
    saddleWith(game, calamity, [giant]);
    pickPermanents(a, giant);
    attack(game, a, [calamity]);
    // Calamity's 4 and two 3-power Hill Giant copies.
    expect(life(game, B)).toBe(10);
    const copies = game.battlefield.filter((id) => game.state.objects[id].isToken);
    expect(copies.length).toBe(2);
    toStep(game, "end");
    settle(game);
    expect(game.battlefield.filter((id) => game.state.objects[id].isToken).length).toBe(0);
  });

  it("Calamity copies nothing when only a legendary creature saddled it", () => {
    const { game, a } = table();
    const calamity = spawn(game, "Calamity, Galloping Inferno");
    const kolodin = spawn(game, "Kolodin, Triumph Caster");
    saddleWith(game, calamity, [kolodin]);
    attack(game, a, [calamity]);
    expect(game.battlefield.filter((id) => game.state.objects[id].isToken).length).toBe(0);
    expect(life(game, B)).toBe(16);
  });

  it("The Gitrog sacrifices a creature that saddled it to draw X and put up to X lands onto the battlefield tapped", () => {
    const { game, a } = table();
    const gitrog = spawn(game, "The Gitrog, Ravenous Ride");
    const giant = spawn(game, "Hill Giant");
    saddleWith(game, gitrog, [giant]);
    const handBefore = hand(game).length;
    pickModes(a, 0);
    a.chooseFromZoneFn = (_view, eligible, _min, max) => eligible.slice(0, max);
    attack(game, a, [gitrog]);
    expect(zone(game, giant)).toBe("graveyard");
    // Drew three (the Giant's power), then put three lands from hand onto the battlefield tapped.
    expect(hand(game).length).toBe(handBefore + 3 - 3);
    const wastes = game.battlefield.filter((id) => game.state.objects[id].cardName === "Wastes");
    expect(wastes.length).toBe(3);
    expect(wastes.every((id) => game.state.objects[id].tapped)).toBe(true);
  });
});

describe("saddled some other way", () => {
  it("Alacrian Armory: +0/+1 and vigilance, and saddles a target Mount at the beginning of combat", () => {
    const { game, a } = table();
    spawn(game, "Alacrian Armory");
    const bighorn = spawn(game, "Bridled Bighorn");
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, bighorn)).toEqual({ power: 3, toughness: 5 });
    expect(keywords(game, bears).has("vigilance")).toBe(true);
    pickTargets(a, bighorn);
    attack(game, a, [bighorn]);
    expect(tokensNamed(game, "Sheep Token")).toBe(1);
    // Nothing saddled it (rule 702.171c).
    expect(game.state.objects[bears].saddledThisTurn).toBeUndefined();
  });

  it("Alacrian Armory: a target Vehicle becomes an artifact creature", () => {
    const { game, a } = table();
    spawn(game, "Alacrian Armory");
    const copter = spawn(game, "Smuggler's Copter");
    pickTargets(a, copter);
    toStep(game, "declare-attackers");
    expect(types(game, copter)).toContain("creature");
    expect(saddled(game, copter)).toBe(false);
  });

  it("Guidelight Matrix draws as it enters, and saddles a target Mount you control at sorcery speed", () => {
    const { game } = table();
    const before = hand(game).length;
    const matrix = enter(game, "Guidelight Matrix");
    expect(hand(game).length).toBe(before + 1);
    const lagac = spawn(game, "Venomsac Lagac");
    lands(game, "Wastes", 2);
    toStep(game, "begin-combat");
    expect(game.canDispatch({ type: "activate-ability", player: A, source: matrix, abilityIndex: 0, targets: [ref(lagac)] })).not.toBeNull();
    toStep(game, "postcombat-main");
    activate(game, matrix, 0, { targets: [ref(lagac)] });
    expect(saddled(game, lagac)).toBe(true);
  });

  it("Kolodin: Mounts and Vehicles have haste; a Mount entering is saddled, a Vehicle an artifact creature", () => {
    const { game } = table();
    spawn(game, "Kolodin, Triumph Caster");
    const lagac = enter(game, "Venomsac Lagac");
    expect(saddled(game, lagac)).toBe(true);
    expect(keywords(game, lagac).has("haste")).toBe(true);
    const copter = enter(game, "Smuggler's Copter");
    expect(types(game, copter)).toContain("creature");
    expect(keywords(game, copter).has("haste")).toBe(true);
  });
});
