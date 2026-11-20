/**
 * A flicker whose return is tapped only for the cards matching a filter
 * (`flicker`'s `tapped` as a `CardFilter`): Silver Surfer, Cosmic Voyager's
 * "Return those cards … at the beginning of the next end step. If a land
 * enters this way, it enters tapped." — and Realm Razer's lands returned
 * tapped when it leaves (`return-exiled-by-source`'s `enterTapped`).
 */
import { describe, expect, it } from "vitest";
import { B, cast, destroy, enter, lands, ref, settle, spawn, table, toHand, toStep, zone } from "./harness.js";

describe("Silver Surfer, Cosmic Voyager", () => {
  it("exiles any number of other permanents you control; at the next end step they return, the lands tapped", () => {
    const { game, a } = table();
    const islands = lands(game, "Island", 6);
    const forest = spawn(game, "Forest");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    a.chooseTargetsFn = (_v, _n, _s, options) => {
      // Not Bob's, nor the Surfer itself.
      expect(options[0]?.some((t) => t.kind === "object" && t.object === theirs)).toBe(false);
      return [ref(forest), ref(bears)];
    };
    const surfer = toHand(game, "Silver Surfer, Cosmic Voyager");
    cast(game, surfer);
    settle(game);
    expect(zone(game, surfer)).toBe("battlefield");
    expect(zone(game, forest)).toBe("exile");
    expect(zone(game, bears)).toBe("exile");
    expect(islands.every((id) => game.state.objects[id].tapped)).toBe(true);
    toStep(game, "end");
    settle(game);
    expect(zone(game, forest)).toBe("battlefield");
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[forest].tapped).toBe(true);
    expect(game.state.objects[bears].tapped).toBe(false);
  });
});

describe("Realm Razer", () => {
  it("exiles all lands; when it leaves, they return tapped under their owners' control", () => {
    const { game } = table();
    const mine = spawn(game, "Forest");
    const theirs = spawn(game, "Mountain", B);
    const razer = enter(game, "Realm Razer");
    expect(zone(game, mine)).toBe("exile");
    expect(zone(game, theirs)).toBe("exile");
    destroy(game, razer);
    expect(zone(game, mine)).toBe("battlefield");
    expect(zone(game, theirs)).toBe("battlefield");
    expect(game.state.objects[theirs].controller).toBe(B);
    expect(game.state.objects[mine].tapped).toBe(true);
    expect(game.state.objects[theirs].tapped).toBe(true);
  });
});
