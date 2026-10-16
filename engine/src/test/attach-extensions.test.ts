import { describe, expect, it } from "vitest";

import { HeuristicBotController } from "../controller.js";

import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  enter,
  hand,
  keywords,
  lands,
  pickFromZone,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

// The `attach` effect's extensions (effects.ts): attaching to the object
// whose entering fired the trigger or to the ability's own source, rather
// than to a target, and attaching every matching permanent at once — each
// only while it is still the object it was (rule 400.7), and only where it
// can legally go (rule 701.3b). And attaching any number of chosen Auras
// and Equipment (`choose`) to a target permanent or player — Ardenn,
// Intrepid Archaeologist; a player only by a Curse (rule 303.4).

describe("attach to the creature that entered", () => {
  it("Hero's Blade moves onto a legendary creature you control as it enters, if you choose", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const blade = spawn(game, "Hero's Blade");
    game.state.objects[blade].attachedTo = bears;
    pickModes(a, 0);
    const isamaru = enter(game, "Isamaru, Hound of Konda");
    expect(game.state.objects[blade].attachedTo).toBe(isamaru);
    expect(pt(game, isamaru)).toEqual({ power: 5, toughness: 4 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("stays where it is when declined, and isn't asked for a creature that isn't legendary", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const blade = spawn(game, "Hero's Blade");
    game.state.objects[blade].attachedTo = bears;
    pickModes(a);
    enter(game, "Isamaru, Hound of Konda");
    expect(game.state.objects[blade].attachedTo).toBe(bears);
    let asked = false;
    a.chooseModesFn = () => {
      asked = true;
      return [0];
    };
    enter(game, "Grizzly Bears");
    expect(asked).toBe(false);
    expect(game.state.objects[blade].attachedTo).toBe(bears);
  });

  it("attaches nothing once the creature has left, even if it's back (rule 400.7)", () => {
    const { game, a } = table();
    const blade = spawn(game, "Hero's Blade");
    // Declines the returned creature's own trigger, so only the first one
    // could attach.
    let asks = 0;
    a.chooseModesFn = () => (asks++ === 0 ? [0] : []);
    const isamaru = enter(game, "Isamaru, Hound of Konda", A, { settle: false });
    game.debugMove(isamaru, "exile");
    game.debugMove(isamaru, "battlefield");
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(game.state.objects[blade].attachedTo ?? null).toBe(null);
  });

  it("Shielded by Faith moves onto an opponent's entering creature, unless it can't enchant it", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const shield = spawn(game, "Shielded by Faith");
    game.state.objects[shield].attachedTo = bears;
    pickModes(a, 0);
    // Protection from white: Shielded by Faith can't enchant it (rule
    // 702.16c), so it stays (rule 701.3b).
    enter(game, "Malakir Bloodwitch", B);
    expect(game.state.objects[shield].attachedTo).toBe(bears);
    const theirs = enter(game, "Grizzly Bears", B);
    expect(game.state.objects[shield].attachedTo).toBe(theirs);
    expect(keywords(game, theirs).has("indestructible")).toBe(true);
    expect(keywords(game, bears).has("indestructible")).toBe(false);
  });

  it("Sword of the Squeak follows a Mouse in, and counts base power or toughness 1", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Burglar Rat");
    const sword = spawn(game, "Sword of the Squeak");
    pickModes(a, 0);
    const jerboa = enter(game, "Canyon Jerboa");
    expect(game.state.objects[sword].attachedTo).toBe(jerboa);
    // Burglar Rat (1/1) and Canyon Jerboa (1/2): two; the Bears (2/2) don't.
    expect(pt(game, jerboa)).toEqual({ power: 3, toughness: 4 });
  });
});

describe("attach to the ability's own source", () => {
  it("Cloud, Ex-SOLDIER takes the targeted Equipment as it enters", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const splitter = spawn(game, "Bonesplitter");
    game.state.objects[splitter].attachedTo = bears;
    a.chooseTargetsFn = () => [{ kind: "object", object: splitter }];
    const cloud = enter(game, "Cloud, Ex-SOLDIER");
    expect(game.state.objects[splitter].attachedTo).toBe(cloud);
    expect(pt(game, cloud)).toEqual({ power: 6, toughness: 4 });
  });

  it("Cloud draws for each equipped attacker, and makes two Treasures at power 7 or greater", () => {
    const { game, a } = table();
    lands(game, "Wastes", 2);
    const cloud = spawn(game, "Cloud, Ex-SOLDIER");
    const bears = spawn(game, "Grizzly Bears");
    const sword = spawn(game, "Short Sword");
    game.state.objects[sword].attachedTo = bears;
    const before = hand(game).length;
    attack(game, a, [cloud, bears]);
    // One equipped attacker (the Bears); Cloud is 4/4, so no Treasures.
    expect(hand(game).length).toBe(before + 1);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
  });

  it("Cloud at power 7 makes the Treasures", () => {
    const { game, a } = table();
    const cloud = spawn(game, "Cloud, Ex-SOLDIER");
    for (const name of ["Bonesplitter", "Short Sword"]) {
      const e = spawn(game, name);
      game.state.objects[e].attachedTo = cloud;
    }
    // 4 + 2 + 1 = 7.
    const before = hand(game).length;
    attack(game, a, [cloud]);
    expect(hand(game).length).toBe(before + 1);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
  });

  it("Cloud attaches nothing when no Equipment is chosen", () => {
    const { game, a } = table();
    const splitter = spawn(game, "Bonesplitter");
    pickTargets(a, null);
    enter(game, "Cloud, Ex-SOLDIER");
    expect(game.state.objects[splitter].attachedTo ?? null).toBe(null);
  });
});

describe("attach every match", () => {
  it("Balan takes all the Equipment you control, and has double strike with two or more", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const balan = spawn(game, "Balan, Wandering Knight");
    const bears = spawn(game, "Grizzly Bears");
    const splitter = spawn(game, "Bonesplitter");
    const sword = spawn(game, "Short Sword");
    const theirs = spawn(game, "Short Sword", B);
    game.state.objects[splitter].attachedTo = bears;
    expect(keywords(game, balan).has("double-strike")).toBe(false);
    activate(game, balan, 0);
    expect(game.state.objects[splitter].attachedTo).toBe(balan);
    expect(game.state.objects[sword].attachedTo).toBe(balan);
    // Only the Equipment you control.
    expect(game.state.objects[theirs].attachedTo ?? null).toBe(null);
    expect(keywords(game, balan).has("double-strike")).toBe(true);
    expect(pt(game, balan)).toEqual({ power: 6, toughness: 4 });
  });

  it("one Equipment on Balan is first strike only", () => {
    const { game } = table();
    const balan = spawn(game, "Balan, Wandering Knight");
    const sword = spawn(game, "Short Sword");
    game.state.objects[sword].attachedTo = balan;
    expect(keywords(game, balan).has("double-strike")).toBe(false);
    expect(keywords(game, balan).has("first-strike")).toBe(true);
  });
});

function board() {
  const t = table({ players: 3 });
  const { game } = t;
  spawn(game, "Ardenn, Intrepid Archaeologist");
  const bears = spawn(game, "Grizzly Bears");
  const elf = spawn(game, "Llanowar Elves");
  const splitter = spawn(game, "Bonesplitter");
  game.state.objects[splitter].attachedTo = elf;
  const rancor = spawn(game, "Rancor");
  game.state.objects[rancor].attachedTo = elf;
  const curse = spawn(game, "Curse of Verbosity");
  game.state.objects[curse].attachedToPlayer = B;
  return { ...t, bears, elf, splitter, rancor, curse };
}

describe("Ardenn, Intrepid Archaeologist", () => {
  it("attaches the chosen Auras and Equipment to target permanent; a Curse can't go there", () => {
    const { game, a, bears, elf, splitter, rancor, curse } = board();
    pickTargets(a, bears);
    const seen = pickPermanents(a, splitter, curse);
    attack(game, a, []);
    expect(seen.offered).toEqual(expect.arrayContaining([splitter, rancor, curse]));
    expect(game.state.objects[splitter].attachedTo).toBe(bears);
    // Not chosen: stays.
    expect(game.state.objects[rancor].attachedTo).toBe(elf);
    // Can't enchant a creature: stays on its player (rule 701.3b).
    expect(game.state.objects[curse].attachedToPlayer).toBe(B);
    expect(game.state.objects[curse].zone).toBe("battlefield");
  });

  it("moves a Curse to target player; Equipment and a creature Aura can't go there", () => {
    const { game, a, elf, splitter, rancor, curse } = board();
    pickTargets(a, C);
    pickPermanents(a, splitter, rancor, curse);
    attack(game, a, []);
    expect(game.state.objects[curse].attachedToPlayer).toBe(C);
    expect(game.state.objects[curse].attachedTo ?? null).toBe(null);
    expect(game.state.objects[splitter].attachedTo).toBe(elf);
    expect(game.state.objects[rancor].attachedTo).toBe(elf);
  });

  it("may attach none", () => {
    const { game, a, bears, elf, splitter } = board();
    pickTargets(a, bears);
    pickPermanents(a);
    attack(game, a, []);
    expect(game.state.objects[splitter].attachedTo).toBe(elf);
    expect(game.state.players[A].hasLost).toBe(false);
  });
});

describe("Light-Paws, Emperor's Voice", () => {
  function setup() {
    const t = table();
    const { game, a } = t;
    lands(game, "Plains", 2);
    const paws = spawn(game, "Light-Paws, Emperor's Voice");
    const armor2 = toLibrary(game, "Ethereal Armor");
    const mantle = toLibrary(game, "Spirit Mantle");
    const cartouche = toLibrary(game, "Cartouche of Solidarity");
    const growth = toLibrary(game, "Wild Growth");
    pickModes(a, 0);
    return { ...t, paws, armor2, mantle, cartouche, growth };
  }

  it("finds an Aura with mana value no greater and a new name, and puts it onto the battlefield on Light-Paws", () => {
    const { game, a, paws, armor2, mantle, cartouche } = setup();
    const seen = pickFromZone(a, cartouche);
    cast(game, toHand(game, "Ethereal Armor"), { targets: [ref(paws)] });
    expect(seen.offered).toContain(cartouche);
    // Mana value 2 is more than Ethereal Armor's 1; a second Ethereal Armor
    // shares a name with an Aura you control.
    expect(seen.offered).not.toContain(mantle);
    expect(seen.offered).not.toContain(armor2);
    expect(zone(game, cartouche)).toBe("battlefield");
    expect(game.state.objects[cartouche].attachedTo).toBe(paws);
  });

  it("leaves an Aura that can't enchant Light-Paws in the library", () => {
    const { game, a, paws, growth } = setup();
    const seen = pickFromZone(a, growth);
    cast(game, toHand(game, "Ethereal Armor"), { targets: [ref(paws)] });
    expect(seen.offered).toContain(growth);
    expect(zone(game, growth)).toBe("library");
  });

  it("doesn't trigger for an Aura that wasn't cast", () => {
    const { game, a, paws, cartouche } = setup();
    let searches = 0;
    a.chooseFromZoneFn = () => {
      searches += 1;
      return [cartouche];
    };
    cast(game, toHand(game, "Ethereal Armor"), { targets: [ref(paws)] });
    // The Cartouche entered attached, not cast: one search only.
    expect(searches).toBe(1);
  });
});

describe("a bot answering Ardenn", () => {
  it("leaves an Aura at work on an opponent's creature where it is", () => {
    const { game } = table();
    const bot = new HeuristicBotController(A);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const splitter = spawn(game, "Bonesplitter");
    const pacifism = spawn(game, "Pacifism");
    game.state.objects[pacifism].attachedTo = theirs;
    game.state.awaiting = {
      kind: "choose-permanents",
      player: A,
      eligible: [splitter, pacifism],
      min: 0,
      max: 2,
      prompt: "Attach any number of Auras and Equipment you control",
      then: { kind: "attach", target: 0, attachment: 0, onto: { kind: "object", object: mine } },
      source: splitter,
      x: 0,
    };
    const view = { player: A, state: game.state } as unknown as Parameters<typeof bot.choosePermanents>[0];
    expect(bot.choosePermanents(view, [splitter, pacifism], 0, 2)).toEqual([splitter]);
  });
});
