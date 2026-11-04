import { describe, expect, it } from "vitest";
import type { Table } from "./harness.js";
import { A, B, C, cast, enter, lands, named, pickModes, ref, settle, spawn, table, toHand, tokensNamed, zone } from "./harness.js";

/**
 * A `may` a player can't do in full isn't theirs to choose, and counts as their
 * not doing it. `each-player-may` reads that as a plain `may` does
 * (`mayBeDone`), and tapping joins what it knows: only untapped permanents can
 * be tapped, and only tapped ones untapped (rule 701.26).
 */

const VAMPIRE = "Lifelink Vampire Token";

/** Every seat's questions counted. */
function counting(t: Table): { asked: string[] } {
  const asked: string[] = [];
  for (const seat of [t.a, t.b, t.c, t.d]) {
    const before = seat.chooseModesFn;
    seat.chooseModesFn = (...args) => {
      asked.push(seat.playerId);
      return before === undefined ? [] : before(...args);
    };
  }
  return { asked };
}

describe("Charismatic Conqueror: they may tap that permanent, and if they don't you get a Vampire", () => {
  it("they tap it: no Vampire", () => {
    const t = table();
    spawn(t.game, "Charismatic Conqueror");
    pickModes(t.b, 0);
    const bears = enter(t.game, "Grizzly Bears", B);
    expect(t.game.state.objects[bears].tapped).toBe(true);
    expect(tokensNamed(t.game, VAMPIRE)).toBe(0);
  });

  it("they don't: it stays untapped, and you get a Vampire with lifelink", () => {
    const t = table();
    spawn(t.game, "Charismatic Conqueror");
    pickModes(t.b);
    const bears = enter(t.game, "Grizzly Bears", B);
    expect(t.game.state.objects[bears].tapped).toBe(false);
    expect(tokensNamed(t.game, VAMPIRE, A)).toBe(1);
    expect(tokensNamed(t.game, VAMPIRE, B)).toBe(0);
  });

  it("an artifact counts; a land, your own creature, and one entering tapped don't", () => {
    const t = table();
    spawn(t.game, "Charismatic Conqueror");
    pickModes(t.b);
    enter(t.game, "Sol Ring", B);
    expect(tokensNamed(t.game, VAMPIRE)).toBe(1);
    enter(t.game, "Wastes", B);
    enter(t.game, "Grizzly Bears", A);
    expect(tokensNamed(t.game, VAMPIRE)).toBe(1);
    // Enters tapped: no trigger at all, so no Vampire (Authority of the Consuls).
    spawn(t.game, "Authority of the Consuls");
    enter(t.game, "Grizzly Bears", B);
    expect(tokensNamed(t.game, VAMPIRE)).toBe(1);
  });

  it("tapped in response: they can't choose to, so the Vampire comes (the ruling)", () => {
    const t = table();
    spawn(t.game, "Charismatic Conqueror");
    pickModes(t.b, 0); // Would tap it, if asked.
    const { asked } = counting(t);
    const bears = enter(t.game, "Grizzly Bears", B, { settle: false });
    lands(t.game, "Island", 3);
    cast(t.game, toHand(t.game, "Frost Breath"), { targets: [ref(bears), null], settle: false });
    settle(t.game);
    expect(t.game.state.objects[bears].tapped).toBe(true);
    expect(asked).toEqual([]);
    expect(tokensNamed(t.game, VAMPIRE, A)).toBe(1);
  });

  it("gone in response: the same (the ruling)", () => {
    const t = table();
    spawn(t.game, "Charismatic Conqueror");
    pickModes(t.b, 0);
    const { asked } = counting(t);
    const bears = enter(t.game, "Grizzly Bears", B, { settle: false });
    lands(t.game, "Mountain", 1);
    cast(t.game, toHand(t.game, "Lightning Bolt"), { targets: [ref(bears)], settle: false });
    settle(t.game);
    expect(zone(t.game, bears)).toBe("graveyard");
    expect(asked).toEqual([]);
    expect(tokensNamed(t.game, VAMPIRE, A)).toBe(1);
  });

  it("asks only the opponent it entered under, of three", () => {
    const t = table({ players: 4 });
    spawn(t.game, "Charismatic Conqueror");
    const { asked } = counting(t);
    enter(t.game, "Grizzly Bears", C);
    expect(asked).toEqual([C]);
    expect(tokensNamed(t.game, VAMPIRE, A)).toBe(1);
  });

  it("they're the opponent it entered under, though you've taken it by then", () => {
    const t = table();
    spawn(t.game, "Charismatic Conqueror");
    pickModes(t.b, 0);
    const { asked } = counting(t);
    const bears = enter(t.game, "Grizzly Bears", B, { settle: false });
    lands(t.game, "Mountain", 5);
    cast(t.game, toHand(t.game, "Word of Seizing"), { targets: [ref(bears)], settle: false });
    settle(t.game);
    expect(t.game.state.objects[bears].controller).toBe(A);
    expect(asked).toEqual([B]);
    expect(t.game.state.objects[bears].tapped).toBe(true);
  });

  it("tokens entering together: a question each, one tapped, one not, one Vampire", () => {
    const t = table();
    spawn(t.game, "Charismatic Conqueror", B);
    const answers = [[0], []];
    let questions = 0;
    t.a.chooseModesFn = () => {
      questions += 1;
      return answers.shift() ?? [];
    };
    lands(t.game, "Plains", 2);
    cast(t.game, toHand(t.game, "Raise the Alarm"));
    expect(questions).toBe(2);
    const soldiers = named(t.game, "Soldier Token", A).map((id) => t.game.state.objects[id]);
    const count = (tapped: boolean): number =>
      soldiers.filter((o) => o.tapped === tapped).reduce((n, o) => n + (o.stackCount ?? 1), 0);
    expect(count(true)).toBe(1);
    expect(count(false)).toBe(1);
    expect(tokensNamed(t.game, VAMPIRE, B)).toBe(1);
  });
});

describe("what `mayBeDone` knows of tapping", () => {
  it("you may tap target creature: not asked of one already tapped", () => {
    const t = table();
    const tapped = spawn(t.game, "Grizzly Bears", B, { tapped: true });
    t.a.chooseTargetsFn = () => [ref(tapped)];
    pickModes(t.a, 0);
    const { asked } = counting(t);
    enter(t.game, "Kitsune Dawnblade");
    expect(asked).toEqual([]);
  });

  it("asked of one that's untapped", () => {
    const t = table();
    const bears = spawn(t.game, "Grizzly Bears", B);
    t.a.chooseTargetsFn = () => [ref(bears)];
    pickModes(t.a, 0);
    const { asked } = counting(t);
    enter(t.game, "Kitsune Dawnblade");
    expect(asked).toEqual([A]);
    expect(t.game.state.objects[bears].tapped).toBe(true);
  });

  it("you may untap this artifact: not asked while it's untapped", () => {
    const t = table();
    spawn(t.game, "Blasting Station");
    const { asked } = counting(t);
    enter(t.game, "Grizzly Bears");
    expect(asked).toEqual([]);
  });

  it("asked once it's tapped", () => {
    const t = table();
    const station = spawn(t.game, "Blasting Station", A, { tapped: true });
    pickModes(t.a, 0);
    const { asked } = counting(t);
    enter(t.game, "Grizzly Bears");
    expect(asked).toEqual([A]);
    expect(t.game.state.objects[station].tapped).toBe(false);
  });
});
