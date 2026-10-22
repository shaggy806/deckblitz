/**
 * Amonkhet, group P: discard payoffs, exert as it attacks and as a cost, a
 * Cartouche, and the rechecks the graveyard shuffle unblocked (Primal
 * Command, The Mending of Dominaria) — the clause of each most likely to be
 * wrong.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
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
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const cycle = (game: Game, card: ObjectId): void => {
  game.dispatch({ type: "cycle", player: A, card });
  settle(game);
};

describe("cycle or discard payoffs", () => {
  it("Faith of the Devoted: pay {1} when you cycle, each opponent loses 2 and you gain 2", () => {
    const { game, a } = table();
    spawn(game, "Faith of the Devoted");
    lands(game, "Island", 1);
    lands(game, "Wastes", 1);
    pickModes(a, 0);
    cycle(game, toHand(game, "River Serpent"));
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
  });

  it("Stir the Sands: cycling it makes a Zombie", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 3);
    cycle(game, toHand(game, "Stir the Sands"));
    expect(tokensNamed(game, "Zombie Token", A)).toBe(1);
  });
});

describe("exert", () => {
  it("Champion of Rhonas: exerted as it attacks, puts a creature card from hand onto the battlefield", () => {
    const { game, a } = table();
    const champion = spawn(game, "Champion of Rhonas");
    const bears = toHand(game, "Grizzly Bears");
    pickModes(a, 0);
    pickFromZone(a, bears);
    attack(game, a, [champion]);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[champion].exertedBy).toBe(A);
  });

  it("Bitterblade Warrior: exerted, +1/+0 and deathtouch", () => {
    const { game, a } = table();
    const warrior = spawn(game, "Bitterblade Warrior");
    pickModes(a, 0);
    attack(game, a, [warrior]);
    expect(pt(game, warrior).power).toBe(3);
    expect(keywords(game, warrior).has("deathtouch")).toBe(true);
    expect(life(game, B)).toBe(17);
  });

  it("Pride Sovereign: {W}, {T}, exert makes two lifelink Cats, and it grows for each other Cat", () => {
    const { game } = table();
    const sovereign = spawn(game, "Pride Sovereign");
    lands(game, "Plains", 1);
    expect(pt(game, sovereign)).toEqual({ power: 2, toughness: 2 });
    activate(game, sovereign, 0);
    expect(tokensNamed(game, "Lifelink Cat Token", A)).toBe(2);
    expect(pt(game, sovereign)).toEqual({ power: 4, toughness: 4 });
    expect(game.state.objects[sovereign].exertedBy).toBe(A);
  });
});

describe("-1/-1 counters", () => {
  it("Decimator Beetle: moves a -1/-1 counter from your creature to the defending player's", () => {
    const { game, a } = table();
    const beetle = spawn(game, "Decimator Beetle");
    const mine = spawn(game, "Grizzly Bears");
    game.state.objects[mine].counters["-1/-1"] = 1;
    const theirs = spawn(game, "Grizzly Bears", B);
    pickTargets(a, mine, theirs);
    attack(game, a, [beetle]);
    expect(counters(game, mine, "-1/-1")).toBe(0);
    expect(counters(game, theirs, "-1/-1")).toBe(1);
  });

  it("Hapatra's Mark: hexproof and every -1/-1 counter removed", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const bears = spawn(game, "Craw Wurm");
    game.state.objects[bears].counters["-1/-1"] = 2;
    cast(game, toHand(game, "Hapatra's Mark"), { targets: [ref(bears)] });
    expect(counters(game, bears, "-1/-1")).toBe(0);
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 4 });
    expect(keywords(game, bears).has("hexproof")).toBe(true);
  });

  it("Merciless Javelineer: discard a card, a -1/-1 counter on the target", () => {
    const { game } = table();
    const javelineer = spawn(game, "Merciless Javelineer");
    lands(game, "Wastes", 2);
    const theirs = spawn(game, "Grizzly Bears", B);
    const before = graveyard(game).length;
    activate(game, javelineer, 0, { targets: [ref(theirs)] });
    expect(counters(game, theirs, "-1/-1")).toBe(1);
    expect(graveyard(game).length).toBe(before + 1);
  });
});

describe("the rest", () => {
  it("Cartouche of Strength: the enchanted creature, +1/+1, fights the target", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    pickTargets(a, theirs);
    cast(game, toHand(game, "Cartouche of Strength"), { targets: [ref(mine)] });
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
    expect(pt(game, mine)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, mine).has("trample")).toBe(true);
  });

  it("Angel of Sanctions: may exile a nonland permanent until it leaves", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring", B);
    pickModes(a, 0);
    pickTargets(a, ring);
    const angel = enter(game, "Angel of Sanctions");
    expect(zone(game, ring)).toBe("exile");
    destroy(game, angel);
    expect(named(game, "Sol Ring", B)).toHaveLength(1);
  });

  it("In Oketra's Name: Zombies +2/+1, other creatures +1/+1", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const zombie = spawn(game, "Desiccated Naga");
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "In Oketra's Name"));
    expect(pt(game, zombie)).toEqual({ power: 5, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
  });

  it("Desiccated Naga: activate only with a Liliana planeswalker", () => {
    const { game } = table();
    const naga = spawn(game, "Desiccated Naga");
    lands(game, "Swamp", 4);
    expect(() => activate(game, naga, 0, { targets: [ref(B)] })).toThrow();
    spawn(game, "Liliana, the Necromancer");
    activate(game, naga, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
  });

  it("Primal Command: your own graveyard shuffled in, without the Command itself", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    const bears = toGraveyard(game, "Grizzly Bears");
    const command = toHand(game, "Primal Command");
    cast(game, command, { modes: [0, 2], targets: [ref(A), ref(A)] });
    expect(life(game, A)).toBe(27);
    expect(zone(game, bears)).toBe("library");
    expect(graveyard(game)).toEqual([command]);
  });

  it("The Mending of Dominaria III: lands back, then the graveyard shuffled in", () => {
    const { game } = table();
    const saga = spawn(game, "The Mending of Dominaria");
    game.state.objects[saga].counters.lore = 2;
    const forest = toGraveyard(game, "Forest");
    const bears = toGraveyard(game, "Grizzly Bears");
    toStep(game, "precombat-main"); // alice's next turn: the third lore counter
    settle(game);
    expect(zone(game, forest)).toBe("battlefield");
    expect(zone(game, bears)).toBe("library");
  });
});
