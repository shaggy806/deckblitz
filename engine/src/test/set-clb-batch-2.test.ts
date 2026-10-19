/**
 * Commander Legends: Battle for Baldur's Gate — the initiative cards (rule 726) and their
 * "if you have the initiative" / "if you've completed a dungeon" lines (309.7), plus Gorion
 * and Venture Forth.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";

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
  hand,
  keywords,
  lands,
  life,
  pickModes,
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
  zone,
} from "./harness.js";

/** "You've completed a dungeon" (309.7), without walking one. */
const completed = (game: Game, player: PlayerId = A): void => {
  game.state.players[player].completedDungeons = ["Undercity"];
};
const pool = (game: Game, type: string, player: PlayerId = A): number =>
  game.state.players[player].manaPool.filter((u) => u.type === type).length;

describe("Feywild Caretaker and Passageway Seer (if you have the initiative)", () => {
  it("make a Faerie Dragon / a counter at your end step only while you have the initiative", () => {
    const { game } = table();
    spawn(game, "Feywild Caretaker");
    const seer = spawn(game, "Passageway Seer");
    game.state.initiative = B;
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Faerie Dragon Token", A)).toBe(0);
    expect(counters(game, seer)).toBe(0);

    game.state.initiative = A;
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Faerie Dragon Token", A)).toBe(1);
    expect(counters(game, seer)).toBe(1);
  });

  it("entering takes the initiative", () => {
    const { game } = table();
    enter(game, "Feywild Caretaker");
    expect(game.state.initiative).toBe(A);
  });
});

describe("Undermountain Adventurer", () => {
  it("adds {G}{G}, or six {G} once you've completed a dungeon", () => {
    const { game } = table();
    const giant = spawn(game, "Undermountain Adventurer");
    activate(game, giant, 0);
    expect(pool(game, "G")).toBe(2);
    game.state.players[A].manaPool = [];
    game.state.objects[giant].tapped = false;
    completed(game);
    activate(game, giant, 0);
    expect(pool(game, "G")).toBe(6);
  });
});

describe("Rilsa Rael, Kingpin", () => {
  it("gives an attacker deathtouch, and +5/+0, first strike and menace after a completed dungeon", () => {
    const { game, a } = table();
    spawn(game, "Rilsa Rael, Kingpin");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(keywords(game, bears).has("deathtouch")).toBe(true);
    expect(keywords(game, bears).has("first-strike")).toBe(false);
    expect(pt(game, bears).power).toBe(2);

    const { game: g2, a: a2 } = table();
    spawn(g2, "Rilsa Rael, Kingpin");
    const bears2 = spawn(g2, "Grizzly Bears");
    completed(g2);
    attack(g2, a2, [bears2]);
    expect(pt(g2, bears2).power).toBe(7);
    for (const k of ["deathtouch", "first-strike", "menace"]) expect(keywords(g2, bears2).has(k)).toBe(true);
  });
});

describe("Dungeoneer's Pack", () => {
  it("takes the initiative, gains 3 life, draws a card and makes a Treasure", () => {
    const { game } = table();
    const pack = spawn(game, "Dungeoneer's Pack");
    // It enters tapped (its replacement applies to a spawn too).
    expect(game.state.objects[pack].tapped).toBe(true);
    game.state.objects[pack].tapped = false;
    lands(game, "Wastes", 2);
    const before = hand(game).length;
    activate(game, pack, 0);
    expect(zone(game, pack)).toBe("graveyard");
    expect(game.state.initiative).toBe(A);
    expect(life(game)).toBe(23);
    // The draw, and Secret Entrance's basic land (Wastes) on top of it.
    expect(hand(game).length).toBeGreaterThanOrEqual(before + 1);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });
});

describe("Loot Dispute", () => {
  it("makes a Treasure on entering and when you attack the player with the initiative", () => {
    const { game, a } = table();
    enter(game, "Loot Dispute");
    expect(game.state.initiative).toBe(A);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    // Attacking Bob while you have it: nothing.
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    game.state.initiative = B;
    const more = spawn(game, "Grizzly Bears");
    toStep(game, "precombat-main");
    attack(game, a, [more]);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
  });

  it("Loud Ruckus: completing a dungeon makes a 5/5 Dragon", () => {
    const { game } = table();
    enter(game, "Loot Dispute");
    const d = game.state.players[A].dungeon!;
    game.state.players[A].dungeon = { ...d, room: 8 };
    game.debugApplyEffect(A, { kind: "venture", into: "undercity" });
    settle(game);
    expect(game.state.players[A].completedDungeons).toEqual(["Undercity"]);
    expect(tokensNamed(game, "Dragon Token", A)).toBe(1);
  });
});

describe("Vicious Battlerager", () => {
  it("each creature blocking it makes its controller lose 5 life", () => {
    const { game, a, b } = table();
    const rager = spawn(game, "Vicious Battlerager");
    const x = spawn(game, "Grizzly Bears", B);
    const y = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [
      { blocker: x, attacker: rager },
      { blocker: y, attacker: rager },
    ];
    attack(game, a, [rager]);
    expect(life(game, B)).toBe(10);
  });
});

describe("Bloodboil Sorcerer", () => {
  it("sacrifices an artifact or creature to goad target creature", () => {
    const { game } = table();
    const sorcerer = spawn(game, "Bloodboil Sorcerer");
    const treasure = spawn(game, "Treasure Token");
    lands(game, "Mountain", 2);
    const theirs = spawn(game, "Grizzly Bears", B);
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: sorcerer,
      abilityIndex: 0,
      targets: [ref(theirs)],
      sacrifice: treasure,
    });
    settle(game);
    expect(zone(game, treasure)).not.toBe("battlefield");
    expect(game.state.objects[theirs].goadedBy).toContain(A);
  });
});

describe("Caves of Chaos Adventurer", () => {
  it("exiles the top card to play this turn, free only (no paying) once you've completed a dungeon", () => {
    const { game, a } = table();
    const caves = spawn(game, "Caves of Chaos Adventurer");
    const top = toLibrary(game, "Grizzly Bears");
    attack(game, a, [caves]);
    expect(zone(game, top)).toBe("exile");
    expect(game.state.objects[top].impulse?.free).toBeUndefined();

    const { game: g2, a: a2 } = table();
    const caves2 = spawn(g2, "Caves of Chaos Adventurer");
    const top2 = toLibrary(g2, "Grizzly Bears");
    completed(g2);
    attack(g2, a2, [caves2]);
    expect(zone(g2, top2)).toBe("exile");
    expect(g2.state.objects[top2].impulse?.free?.only).toBe(true);
    lands(g2, "Forest", 2);
    // Paying for it isn't allowed: the only permission is the free one.
    expect(() => g2.dispatch({ type: "cast-spell", player: A, card: top2, targets: [], via: "impulse" })).toThrow();
    g2.dispatch({ type: "cast-spell", player: A, card: top2, targets: [], via: "impulse", free: true });
    settle(g2);
    expect(zone(g2, top2)).toBe("battlefield");
  });
});

describe("Sarevok's Tome", () => {
  it("adds {C}, or {C}{C} with the initiative", () => {
    const { game } = table();
    const tome = spawn(game, "Sarevok's Tome");
    activate(game, tome, 0);
    expect(pool(game, "C")).toBe(1);
    game.state.players[A].manaPool = [];
    game.state.objects[tome].tapped = false;
    game.state.initiative = A;
    activate(game, tome, 0);
    expect(pool(game, "C")).toBe(2);
  });

  it("its {3},{T} ability needs a completed dungeon, then exiles to a nonland card to cast free", () => {
    const { game, a } = table();
    const tome = spawn(game, "Sarevok's Tome");
    lands(game, "Wastes", 3);
    expect(() => activate(game, tome, 1)).toThrow();
    completed(game);
    const bears = toLibrary(game, "Grizzly Bears");
    const land = toLibrary(game, "Wastes");
    a.chooseCastNowFn = (_view, offer) =>
      offer.cards[0] === undefined
        ? null
        : { type: "cast-spell", player: A, card: offer.cards[0], targets: [], via: "effect", free: true };
    activate(game, tome, 1);
    expect(zone(game, land)).toBe("exile");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Explore the Underdark", () => {
  it("fetches two basics tapped and takes the initiative", () => {
    const { game, a } = table();
    lands(game, "Forest", 5);
    const spell = toHand(game, "Explore the Underdark");
    const before = game.state.zones.shared.battlefield.length;
    // Take as many as allowed: two for the spell, then Secret Entrance's one.
    a.chooseFromZoneFn = (_view, eligible, _min, max) => eligible.slice(0, max);
    cast(game, spell);
    expect(game.state.initiative).toBe(A);
    expect(game.state.zones.shared.battlefield.length).toBe(before + 2);
    expect(game.state.zones.shared.battlefield.slice(before).every((id) => game.state.objects[id].tapped)).toBe(true);
  });
});

describe("White Plume Adventurer", () => {
  it("untaps one of your creatures at each opponent's upkeep, or all of them after a completed dungeon", () => {
    const { game, a } = table();
    spawn(game, "White Plume Adventurer");
    const x = spawn(game, "Grizzly Bears", A, { tapped: true });
    const y = spawn(game, "Grizzly Bears", A, { tapped: true });
    a.choosePermanentsFn = () => [x];
    toStep(game, "upkeep", B);
    settle(game);
    expect(game.state.objects[x].tapped).toBe(false);
    expect(game.state.objects[y].tapped).toBe(true);
  });

  it("all of them once you've completed a dungeon", () => {
    const { game } = table();
    spawn(game, "White Plume Adventurer");
    const x = spawn(game, "Grizzly Bears", A, { tapped: true });
    const y = spawn(game, "Grizzly Bears", A, { tapped: true });
    completed(game);
    toStep(game, "upkeep", B);
    settle(game);
    expect(game.state.objects[x].tapped).toBe(false);
    expect(game.state.objects[y].tapped).toBe(false);
  });
});

describe("Tomb of Horrors Adventurer", () => {
  const twoBolts = (done: boolean): number => {
    const { game } = table();
    spawn(game, "Tomb of Horrors Adventurer");
    lands(game, "Mountain", 2);
    if (done) completed(game);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    return life(game, B);
  };
  it("copies your second spell each turn — twice after a completed dungeon", () => {
    expect(twoBolts(false)).toBe(20 - 3 * 3);
    expect(twoBolts(true)).toBe(20 - 3 * 4);
  });
});

describe("From the Catacombs", () => {
  it("reanimates from any graveyard with a corpse counter, takes the initiative, and exiles it if it would leave", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const bears = toGraveyard(game, "Grizzly Bears", B);
    cast(game, toHand(game, "From the Catacombs"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
    expect(counters(game, bears, "corpse")).toBe(1);
    expect(game.state.initiative).toBe(A);
    destroy(game, bears);
    expect(zone(game, bears)).toBe("exile");
  });
});

describe("Imoen, Mystic Trickster and Safana, Calimport Cutthroat", () => {
  it("with the initiative: a card / a Treasure at your end step, two / three after a completed dungeon", () => {
    const run = (done: boolean): [number, number] => {
      const { game } = table();
      spawn(game, "Imoen, Mystic Trickster");
      spawn(game, "Safana, Calimport Cutthroat");
      game.state.initiative = A;
      if (done) completed(game);
      const before = hand(game).length;
      toStep(game, "end");
      settle(game);
      return [hand(game).length - before, tokensNamed(game, "Treasure Token", A)];
    };
    expect(run(false)).toEqual([1, 1]);
    expect(run(true)).toEqual([2, 3]);
  });
});

describe("Gorion, Wise Mentor", () => {
  it("may copy an Adventure spell you cast", () => {
    const { game, a } = table();
    spawn(game, "Gorion, Wise Mentor");
    const poisoner = toHand(game, "Gumdrop Poisoner");
    lands(game, "Swamp", 4);
    pickModes(a, 0);
    cast(game, poisoner, { face: 1 });
    expect(tokensNamed(game, "Food Token", A)).toBe(2);
  });
});

describe("Venture Forth", () => {
  it("exiles down to a land, puts it onto the battlefield, and suspends itself with three time counters", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const spell = toHand(game, "Venture Forth");
    const forest = toLibrary(game, "Forest");
    const bears = toLibrary(game, "Grizzly Bears");
    cast(game, spell);
    expect(zone(game, forest)).toBe("battlefield");
    expect(zone(game, bears)).toBe("library");
    expect(zone(game, spell)).toBe("exile");
    expect(counters(game, spell, "time")).toBe(3);
  });
});
