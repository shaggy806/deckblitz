/**
 * "Whenever an opponent shuffles their library" — the `shuffles-library`
 * trigger event over `library-shuffled` (rule 701.24a), the library's owner
 * its player: once per shuffle, a library of one card too (701.24e), and
 * twice for Green Sun's Zenith's search and then itself (Psychic Surgery's
 * ruling, 701.24f). Psychic Surgery looks at the top two of that library and
 * may exile one; Cosi's Trickster may get a +1/+1 counter.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { A, B, cast, counters, lands, life, nextTurn, pickModes, settle, spawn, table, toHand, zone } from "./harness.js";

const shuffleOf = (game: ReturnType<typeof table>["game"], player: typeof A): void => {
  game.debugApplyEffect(player, { kind: "shuffle-library" }, []);
  settle(game);
};

describe("Psychic Surgery", () => {
  it("an opponent shuffles: look at the top two of their library, exile one, the other stays on top", () => {
    const { game, a } = table();
    spawn(game, "Psychic Surgery", A);
    pickModes(a, 0);
    let offered: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      offered = eligible;
      return [eligible[0]];
    };
    const before = game.state.zones.perPlayer[B].library.length;
    shuffleOf(game, B);
    const library = game.state.zones.perPlayer[B].library;
    expect(offered).toHaveLength(2);
    expect(zone(game, offered[0])).toBe("exile");
    expect(game.state.objects[offered[0]].owner).toBe(B);
    expect(library[0]).toBe(offered[1]);
    expect(library).toHaveLength(before - 1);
  });

  it("declining the look changes nothing", () => {
    const { game, a } = table();
    spawn(game, "Psychic Surgery", A);
    pickModes(a);
    const before = game.state.zones.perPlayer[B].library.length;
    shuffleOf(game, B);
    expect(game.state.zones.perPlayer[B].library).toHaveLength(before);
    expect(game.state.zones.shared.exile).toHaveLength(0);
  });

  it("your own shuffle doesn't trigger it", () => {
    const { game, a } = table();
    spawn(game, "Psychic Surgery", A);
    pickModes(a, 0);
    let asked = false;
    a.chooseFromZoneFn = (_view, eligible) => {
      asked = true;
      return [eligible[0]];
    };
    const before = game.state.zones.perPlayer[A].library.length;
    shuffleOf(game, A);
    expect(asked).toBe(false);
    expect(game.state.zones.perPlayer[A].library).toHaveLength(before);
  });

  it("a library of one card shuffled: it triggers, and the card can be exiled (the ruling)", () => {
    const { game, a } = table();
    spawn(game, "Psychic Surgery", A);
    const library = game.state.zones.perPlayer[B].library;
    for (const id of library.slice(1)) game.debugMove(id, "graveyard");
    expect(library).toHaveLength(1);
    const last = library[0];
    pickModes(a, 0);
    a.chooseFromZoneFn = (_view, eligible) => [...eligible];
    shuffleOf(game, B);
    expect(zone(game, last)).toBe("exile");
  });

  it("Green Sun's Zenith shuffles twice: two triggers (the ruling)", () => {
    const { game, a } = table();
    spawn(game, "Psychic Surgery", A);
    nextTurn(game);
    lands(game, "Forest", 1, B);
    pickModes(a, 0);
    let looks = 0;
    a.chooseFromZoneFn = () => {
      looks += 1;
      return [];
    };
    cast(game, toHand(game, "Green Sun's Zenith", B), { player: B, x: 0 });
    expect(looks).toBe(2);
  });
});

describe("Cosi's Trickster", () => {
  it("each opponent shuffle may put a +1/+1 counter on it; its controller's own doesn't", () => {
    const { game, a } = table();
    const trickster = spawn(game, "Cosi's Trickster", A);
    pickModes(a, 0);
    shuffleOf(game, B);
    shuffleOf(game, B);
    expect(counters(game, trickster)).toBe(2);
    shuffleOf(game, A);
    expect(counters(game, trickster)).toBe(2);
    pickModes(a);
    shuffleOf(game, B);
    expect(counters(game, trickster)).toBe(2);
  });
});

describe("Psychogenic Probe", () => {
  it("any player's shuffle deals 2 damage to that player, its controller's own included", () => {
    const { game } = table();
    spawn(game, "Psychogenic Probe", A);
    const [a0, b0] = [life(game, A), life(game, B)];
    shuffleOf(game, B);
    expect(life(game, B)).toBe(b0 - 2);
    expect(life(game, A)).toBe(a0);
    shuffleOf(game, A);
    expect(life(game, A)).toBe(a0 - 2);
  });

  it("Green Sun's Zenith shuffles twice: 4 damage to its caster", () => {
    const { game } = table();
    spawn(game, "Psychogenic Probe", A);
    nextTurn(game);
    lands(game, "Forest", 1, B);
    const b0 = life(game, B);
    cast(game, toHand(game, "Green Sun's Zenith", B), { player: B, x: 0 });
    settle(game);
    expect(life(game, B)).toBe(b0 - 4);
  });

  it("an empty library still is shuffled (the ruling)", () => {
    const { game } = table();
    spawn(game, "Psychogenic Probe", A);
    for (const id of [...game.state.zones.perPlayer[B].library]) game.debugMove(id, "graveyard");
    const b0 = life(game, B);
    shuffleOf(game, B);
    expect(life(game, B)).toBe(b0 - 2);
  });
});
