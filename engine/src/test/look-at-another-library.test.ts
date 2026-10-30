import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { B, attack, cast, enter, lands, pickTargets, ref, spawn, table, toHand, toLibrary, zone } from "./harness.js";

type Game = ReturnType<typeof table>["game"];

const top = (game: Game, player = B, n = 5): readonly ObjectId[] => game.state.zones.perPlayer[player].library.slice(0, n);

/** Three named cards on top of `player`'s library, the first on top. */
function stack(game: Game, names: readonly string[], player = B): ObjectId[] {
  return [...names].reverse().map((name) => toLibrary(game, name, player)).reverse();
}

describe("look-and-choose over another player's library (`from`)", () => {
  it("lets you reorder the top three of target player's library (Architects of Will)", () => {
    const { game, a } = table();
    const [bolt, bear, elves] = stack(game, ["Lightning Bolt", "Grizzly Bears", "Llanowar Elves"]);
    pickTargets(a, B);
    let offered: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      offered = eligible;
      return [elves, bolt, bear];
    };
    enter(game, "Architects of Will");
    // You look and choose; bob's cards go back on bob's library.
    expect([...offered].sort()).toEqual([bolt, bear, elves].sort());
    expect(top(game, B, 3)).toEqual([elves, bolt, bear]);
  });

  it("may put the top card into its owner's graveyard (Draugr Thought-Thief)", () => {
    const { game, a } = table();
    const [bear] = stack(game, ["Grizzly Bears"]);
    pickTargets(a, B);
    a.chooseFromZoneFn = (_view, eligible) => eligible;
    enter(game, "Draugr Thought-Thief");
    expect(zone(game, bear)).toBe("graveyard");
    expect(game.state.zones.perPlayer[B].graveyard).toContain(bear);
  });

  it("leaves the top card where it was when declined", () => {
    const { game, a } = table();
    const [bear] = stack(game, ["Grizzly Bears"]);
    pickTargets(a, B);
    a.chooseFromZoneFn = () => [];
    enter(game, "Draugr Thought-Thief");
    expect(top(game, B, 1)).toEqual([bear]);
  });

  it("mills one and has you order the rest on top (Cruel Fate)", () => {
    const { game, a } = table();
    lands(game, "Island", 5);
    const fate = toHand(game, "Cruel Fate");
    const [bolt, bear, elves] = stack(game, ["Lightning Bolt", "Grizzly Bears", "Llanowar Elves"]);
    const asked: (readonly ObjectId[])[] = [];
    a.chooseFromZoneFn = (_view, eligible, min) => {
      asked.push(eligible);
      // First the card to mill, then the order of the rest.
      return asked.length === 1 ? [bolt] : min === 0 ? [] : [...eligible].reverse();
    };
    cast(game, fate, { targets: [ref(B)] });
    expect(zone(game, bolt)).toBe("graveyard");
    // The order asked was over the four left on top (two Wastes under them).
    expect(asked).toHaveLength(2);
    expect(asked[1]).not.toContain(bolt);
    expect(asked[1]).toContain(bear);
    const rest = [...asked[1]].reverse();
    expect(top(game, B, rest.length)).toEqual(rest);
    expect(rest).toContain(elves);
  });

  it("exiles X's choice and leaves the rest on top (Sealed Fate)", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    lands(game, "Swamp", 1);
    const sealed = toHand(game, "Sealed Fate");
    const [bolt, bear] = stack(game, ["Lightning Bolt", "Grizzly Bears"]);
    let offered: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      if (offered.length === 0) offered = eligible;
      return eligible.includes(bear) && eligible.includes(bolt) ? [bear] : eligible;
    };
    cast(game, sealed, { x: 2, targets: [ref(B)] });
    expect([...offered].sort()).toEqual([bolt, bear].sort());
    expect(zone(game, bear)).toBe("exile");
    expect(top(game, B, 1)).toEqual([bolt]);
  });

  it("reveals the damaged player's top two and you choose the one milled (Balshan Beguiler)", () => {
    const { game, a, b } = table();
    const beguiler = spawn(game, "Balshan Beguiler");
    const [bolt, bear] = stack(game, ["Lightning Bolt", "Grizzly Bears"]);
    let asked = false;
    a.chooseFromZoneFn = () => {
      asked = true;
      return [bear];
    };
    b.chooseFromZoneFn = () => {
      throw new Error("the damaged player chose");
    };
    attack(game, a, [beguiler]);
    expect(asked).toBe(true);
    expect(zone(game, bear)).toBe("graveyard");
    expect(top(game, B, 1)).toEqual([bolt]);
    const revealed = game.events.flatMap((e) => (e.type === "cards-revealed" && e.player === B ? e.objects : []));
    expect(revealed).toEqual(expect.arrayContaining([bolt, bear]));
  });
});
