/**
 * A shuffled face-down pile of exiled cards, manifested (rule 701.40a) —
 * `cloak-exiled-pile` with `manifest`: Ghastly Conscription's "exile all
 * creature cards from target player's graveyard in a face-down pile, shuffle
 * that pile, then manifest those cards" (`graveyard`), and Jeskai
 * Infiltrator's "exile it and the top card of your library in a face-down
 * pile, shuffle that pile, then manifest those cards" (`source`).
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  attack,
  cast,
  destroy,
  graveyard,
  keywords,
  lands,
  life,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

type G = ReturnType<typeof table>["game"];

const faceDown = (game: G, player = A): ObjectId[] =>
  game.state.zones.shared.battlefield.filter(
    (id) => game.state.objects[id].faceDown !== undefined && game.state.objects[id].controller === player,
  );

describe("Ghastly Conscription", () => {
  it("manifests every creature card from the target player's graveyard under its caster", () => {
    const { game } = table();
    const bears = toGraveyard(game, "Grizzly Bears", B);
    const wurm = toGraveyard(game, "Craw Wurm", B);
    const bolt = toGraveyard(game, "Lightning Bolt", B);
    lands(game, "Swamp", 7);
    cast(game, toHand(game, "Ghastly Conscription"), { targets: [ref(B)] });
    const down = faceDown(game);
    expect([...down].sort()).toEqual([bears, wurm].sort());
    for (const id of down) {
      const object = game.state.objects[id];
      expect(object.faceDown?.kind).toBe("manifest");
      expect(object.owner).toBe(B);
      expect(object.exiledFaceDown).toBeUndefined();
      expect(pt(game, id)).toEqual({ power: 2, toughness: 2 });
    }
    // The noncreature card stays where it was.
    expect(graveyard(game, B)).toEqual([bolt]);
    // Manifested, not cloaked: no ward.
    expect(keywords(game, bears).has("ward")).toBe(false);
  });

  it("an empty graveyard manifests nothing", () => {
    const { game } = table();
    lands(game, "Swamp", 7);
    cast(game, toHand(game, "Ghastly Conscription"), { targets: [ref(A)] });
    expect(faceDown(game)).toEqual([]);
  });

  it("the pile's order isn't the graveyard's, across seeds", () => {
    const orders = new Set<string>();
    for (let seed = 1; seed <= 8; seed += 1) {
      const { game } = table({ seed });
      const names = ["Grizzly Bears", "Craw Wurm", "Hill Giant"];
      const cards = names.map((name) => toGraveyard(game, name, A));
      lands(game, "Swamp", 7);
      cast(game, toHand(game, "Ghastly Conscription"), { targets: [ref(A)] });
      orders.add(faceDown(game).map((id) => cards.indexOf(id)).join(""));
    }
    expect(orders.size).toBeGreaterThan(1);
  });
});

describe("Jeskai Infiltrator", () => {
  it("can't be blocked while you control no other creatures", () => {
    const { game } = table();
    const infiltrator = spawn(game, "Jeskai Infiltrator");
    expect(keywords(game, infiltrator).has("unblockable")).toBe(true);
    spawn(game, "Grizzly Bears");
    expect(keywords(game, infiltrator).has("unblockable")).toBe(false);
  });

  it("dealing combat damage, exiles itself and the top card and manifests both", () => {
    const { game, a } = table();
    const infiltrator = spawn(game, "Jeskai Infiltrator");
    game.state.objects[infiltrator].summoningSick = false;
    const top = game.state.zones.perPlayer[A].library[0];
    attack(game, a, [infiltrator]);
    expect(life(game, B)).toBe(18);
    const down = faceDown(game);
    expect([...down].sort()).toEqual([infiltrator, top].sort());
    for (const id of down) expect(game.state.objects[id].faceDown?.kind).toBe("manifest");
  });

  it("gone before its trigger resolves, only the library's top card is manifested", () => {
    const { game, a } = table();
    const infiltrator = spawn(game, "Jeskai Infiltrator");
    game.state.objects[infiltrator].summoningSick = false;
    const top = game.state.zones.perPlayer[A].library[0];
    a.declareAttackersFn = () => [{ attacker: infiltrator, defender: B }];
    game.advanceUntil((s) => s.zones.shared.stack.length > 0);
    destroy(game, infiltrator);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(zone(game, infiltrator)).toBe("graveyard");
    expect(faceDown(game)).toEqual([top]);
  });
});
